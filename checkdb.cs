using System;
using System.Data.SqlClient;

class Program {
    static void Main() {
        var connStr = ""Server=.;Database=QL_WebMuaBanNongSan;Trusted_Connection=True;TrustServerCertificate=True;Encrypt=False"";
        using var conn = new SqlConnection(connStr);
        conn.Open();
        var cmd = new SqlCommand(""SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME LIKE '%Notif%'"", conn);
        using var reader = cmd.ExecuteReader();
        while(reader.Read()) {
            Console.WriteLine(reader[0]);
        }
    }
}
