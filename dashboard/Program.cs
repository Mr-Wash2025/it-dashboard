using System;
using System.Windows.Forms;

namespace TeacherRemoteApp
{
    static class Program
    {
        [STAThread]
        static void Main()
        {
            Application.EnableVisualStyles();
            Application.SetCompatibleTextRenderingDefault(false);
            Application.Run(new Form1()); // runs the hidden form
        }
    }
}