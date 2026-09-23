# ==============================================================================
# Script Export Database Dump: QL_WebMuaBanNongSan
# Xuat toan bo du lieu thuc te dang chay tren SQL Server sang file SQL
# ==============================================================================

$connectionString = "Server=.;Database=QL_WebMuaBanNongSan;Integrated Security=True;TrustServerCertificate=True"
$connection = New-Object System.Data.SqlClient.SqlConnection($connectionString)
$connection.Open()

Write-Host "Ket noi thanh cong den CSDL QL_WebMuaBanNongSan..." -ForegroundColor Green

# Danh sach cac bang theo thu tu rang buoc khoa ngoai
$tablesOrder = @(
    "Roles",
    "Categories",
    "Certifications",
    "Suppliers",
    "Users",
    "Farms",
    "Products",
    "ProductImages",
    "ProductCertifications",
    "ProductSeasons",
    "Batches",
    "Inventories",
    "MembershipTiers",
    "UserLoyalties",
    "PointTransactions",
    "Promotions",
    "PromotionProducts",
    "UserVouchers",
    "Addresses",
    "Orders",
    "OrderItems",
    "Payments",
    "Carts",
    "CartItems",
    "Reviews",
    "ReviewImages",
    "ReviewHelpfulVotes",
    "Notifications",
    "UserBehaviors",
    "RecommendationLogs",
    "RefreshTokens",
    "AuditLogs"
)

$sb = New-Object System.Text.StringBuilder

[void]$sb.AppendLine("-- ==============================================================================")
[void]$sb.AppendLine("-- 2. NẠP TOÀN BỘ DỮ LIỆU THỰC TẾ (LIVE DATABASE DUMP)")
[void]$sb.AppendLine("-- Ngày sao lưu: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')")
[void]$sb.AppendLine("-- ==============================================================================")
[void]$sb.AppendLine("EXEC sp_MSforeachtable 'ALTER TABLE ? NOCHECK CONSTRAINT all';")
[void]$sb.AppendLine("GO")
[void]$sb.AppendLine("")

$totalRows = 0

foreach ($table in $tablesOrder) {
    # Kiem tra bang co IDENTITY khong
    $cmdCheckIdentity = $connection.CreateCommand()
    $cmdCheckIdentity.CommandText = "SELECT COUNT(*) FROM sys.identity_columns WHERE object_id = OBJECT_ID('[dbo].[$table]')"
    $hasIdentity = ([int]$cmdCheckIdentity.ExecuteScalar()) -gt 0
    $cmdCheckIdentity.Dispose()

    # Lay danh sach cot
    $cmdCols = $connection.CreateCommand()
    $cmdCols.CommandText = "SELECT c.name, t.name as type_name FROM sys.columns c INNER JOIN sys.types t ON c.user_type_id = t.user_type_id WHERE c.object_id = OBJECT_ID('[dbo].[$table]') ORDER BY c.column_id"
    $readerCols = $cmdCols.ExecuteReader()
    $columns = @()
    $colTypes = @{}
    while ($readerCols.Read()) {
        $cName = $readerCols["name"].ToString()
        $cType = $readerCols["type_name"].ToString()
        $columns += $cName
        $colTypes[$cName] = $cType
    }
    $readerCols.Close()
    $cmdCols.Dispose()

    # Lay du lieu
    $cmdData = $connection.CreateCommand()
    $cmdData.CommandText = "SELECT * FROM [dbo].[$table]"
    $readerData = $cmdData.ExecuteReader()

    $rows = New-Object System.Collections.Generic.List[string]

    while ($readerData.Read()) {
        $vals = @()
        foreach ($col in $columns) {
            $val = $readerData[$col]
            if ($val -eq [DBNull]::Value -or $null -eq $val) {
                $vals += "NULL"
            } else {
                $t = $colTypes[$col].ToLower()
                if ($t -in @("bigint", "int", "smallint", "tinyint")) {
                    $vals += "$val"
                } elseif ($t -in @("decimal", "numeric", "float", "real", "money", "smallmoney")) {
                    $vals += ([System.Convert]::ToString($val, [System.Globalization.CultureInfo]::InvariantCulture))
                } elseif ($t -eq "bit") {
                    $vals += if ($val) { "1" } else { "0" }
                } elseif ($t -in @("datetime", "datetime2", "date", "smalldatetime", "time")) {
                    $dt = [System.Convert]::ToDateTime($val)
                    if ($t -eq "date") {
                        $vals += "'" + $dt.ToString("yyyy-MM-dd") + "'"
                    } else {
                        $vals += "'" + $dt.ToString("yyyy-MM-dd HH:mm:ss.fff") + "'"
                    }
                } elseif ($t -in @("varbinary", "binary", "image", "timestamp")) {
                    $hex = [System.BitConverter]::ToString([byte[]]$val) -replace '-', ''
                    $vals += "0x$hex"
                } else {
                    # string / nvarchar / varchar
                    $escaped = $val.ToString().Replace("'", "''")
                    $vals += "N'$escaped'"
                }
            }
        }
        $colNamesStr = ($columns | ForEach-Object { "[$_]" }) -join ", "
        $valStr = $vals -join ", "
        $rows.Add("INSERT INTO [dbo].[$table] ($colNamesStr) VALUES ($valStr);")
    }
    $readerData.Close()
    $cmdData.Dispose()

    $count = $rows.Count
    $totalRows += $count
    Write-Host "Bang $table : $count dong" -ForegroundColor Cyan

    if ($count -gt 0) {
        [void]$sb.AppendLine("-- -------------------------------------------------------------")
        [void]$sb.AppendLine("-- Data for: [dbo].[$table] ($count rows)")
        [void]$sb.AppendLine("-- -------------------------------------------------------------")
        if ($hasIdentity) {
            [void]$sb.AppendLine("SET IDENTITY_INSERT [dbo].[$table] ON;")
        }
        foreach ($r in $rows) {
            [void]$sb.AppendLine($r)
        }
        if ($hasIdentity) {
            [void]$sb.AppendLine("SET IDENTITY_INSERT [dbo].[$table] OFF;")
        }
        [void]$sb.AppendLine("GO")
        [void]$sb.AppendLine("")
    }
}

[void]$sb.AppendLine("-- Bat lai toan bo rang buoc khoa ngoai")
[void]$sb.AppendLine("EXEC sp_MSforeachtable 'ALTER TABLE ? WITH CHECK CHECK CONSTRAINT all';")
[void]$sb.AppendLine("GO")

$connection.Close()

Write-Host "Tong so ban ghi da trich xuat: $totalRows" -ForegroundColor Green

# Doc phan DDL Schema tu file hien tai
$fullFilePath = "C:\123\KhoaLuanCuNhan\database\QL_WebMuaBanNongSan_Full.sql"
$oldContent = [System.IO.File]::ReadAllText($fullFilePath, [System.Text.Encoding]::UTF8)

# Cat lay phan Schema DDL (tu dau den truoc phan 2. SEED DATA)
$splitMarker = "-- =============================================================================="
$markerIndex = $oldContent.IndexOf("2. NẠP TOÀN BỘ DỮ LIỆU")
if ($markerIndex -lt 0) {
    $markerIndex = $oldContent.IndexOf("2. SEED & PRODUCTION DATA")
}
if ($markerIndex -lt 0) {
    $markerIndex = $oldContent.IndexOf("2. SEED DATA")
}

if ($markerIndex -gt 0) {
    # Tim vi tri phan tach truoc do
    $schemaPart = $oldContent.Substring(0, $markerIndex)
    $lastSep = $schemaPart.LastIndexOf("-- ==============================================================================")
    if ($lastSep -gt 0) {
        $schemaPart = $schemaPart.Substring(0, $lastSep)
    }
} else {
    Write-Error "Khong tim thay marker phan tach du lieu!"
    exit 1
}

# Ghep phan Schema DDL voi Data moi
$finalContent = $schemaPart.TrimEnd() + "`r`n`r`n" + $sb.ToString()

# Ghi ra 2 file: QL_WebMuaBanNongSan_Full.sql va scripts/06_full_database_dump.sql
$utf8WithBom = New-Object System.Text.UTF8Encoding($true)
[System.IO.File]::WriteAllText($fullFilePath, $finalContent, $utf8WithBom)
Write-Host "Da cap nhat thanh cong: $fullFilePath" -ForegroundColor Green

$scriptDumpPath = "C:\123\KhoaLuanCuNhan\database\scripts\06_full_database_dump.sql"
[System.IO.File]::WriteAllText($scriptDumpPath, $finalContent, $utf8WithBom)
Write-Host "Da cap nhat thanh cong: $scriptDumpPath" -ForegroundColor Green
