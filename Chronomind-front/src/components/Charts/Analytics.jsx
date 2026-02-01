import Sidebar from "../Dashboard/Sidebar/Sidebar";
import DashboardCharts from "../../components/Charts/DashboardCharts";

export default function Analytics() {

  return (

    <div className="dashboard-layout">

      <Sidebar />

      <main className="dashboard-content">

        <header className="dashboard-header">

          <h1>
            Analytics <span>Dashboard</span>
          </h1>

          <p>Acompanhe sua produtividade</p>

        </header>

        <DashboardCharts />

      </main>

    </div>
  );
}
