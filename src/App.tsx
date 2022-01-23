import React from "react";

type Employee = {
  employeeA: number;
  employeeB: number;
  projectId: number;
  sum: number;
};

function App() {
  const [data, setData] = React.useState<any>([]);

  const showFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target?.result as any;
      const textArr = text
        .replace(/(?:\r\n|\r|\n)/g, "|")
        .split("|")
        .filter(Boolean)
        .map((d: string) => {
          const newData = d.split(",");
          return [
            +newData[0].trim(),
            +newData[1].trim(),
            new Date(newData[2].trim()),
            newData[3].trim() === "NULL"
              ? new Date()
              : new Date(newData[3].trim()),
          ];
        });

      // group Employees by project id
      const ProjectEmployees = textArr.reduce(
        (r, [EmployeeID, ProjectID, StartDate, endDateDate]) => {
          let startDate = StartDate,
            endDate = endDateDate;
          r[ProjectID] = r[ProjectID] ?? [];
          r[ProjectID].push({ EmployeeID, startDate, endDate });
          return r;
        },
        {}
      );

      const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
      // combination of pairs of employees per project
      let combination = {};
      for (let projectId in ProjectEmployees)
        for (let i = 0; i < ProjectEmployees[projectId].length - 1; i++)
          for (let j = i + 1; j < ProjectEmployees[projectId].length; j++) {
            let employeeA = ProjectEmployees[projectId][i];
            let employeeB = ProjectEmployees[projectId][j];

            if (
              (employeeA.endDate <= employeeB.endDate &&
                employeeA.endDate > employeeB.startDate) ||
              (employeeB.endDate <= employeeA.endDate &&
                employeeB.endDate > employeeA.startDate)
            ) {
              let D1 =
                  employeeA.startDate > employeeB.startDate
                    ? employeeA.startDate
                    : employeeB.startDate,
                D2 =
                  employeeA.endDate < employeeB.endDate
                    ? employeeA.endDate
                    : employeeB.endDate,
                days = Math.ceil((D2 - D1) / oneDay),
                key = `${employeeA.EmployeeID}-${employeeB.EmployeeID}-${projectId}`;
              combination[key] = combination[key] ?? {
                employeeA: +employeeA.EmployeeID,
                employeeB: +employeeB.EmployeeID,
                projectId: +projectId,
                sum: days,
              };
            }
          }

      const Result = Object.entries(combination)
        .sort((a: any, b: any) => b[1].sum - a[1].sum)
        .map(([k, v]) => v);

      setData(Result);
    };
    reader.readAsText((e.target as any).files[0]);
  };

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div>
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <input type="file" onChange={(e) => showFile(e)} />
        </div>
        {data.length > 0 && (
          <table style={{ minWidth: "800px" }}>
            <tr>
              <th>Employee ID #1</th>
              <th>Employee ID #2</th>
              <th>Project ID</th>
              <th>Days Worked</th>
            </tr>
            {data.map((d: Employee, i: number) => (
              <tr key={i.toString()}>
                <td style={{ textAlign: "center" }}>{d.employeeA}</td>
                <td style={{ textAlign: "center" }}>{d.employeeB}</td>
                <td style={{ textAlign: "center" }}>{d.projectId}</td>
                <td style={{ textAlign: "center" }}>{d.sum}</td>
              </tr>
            ))}
          </table>
        )}
      </div>
    </div>
  );
}

export default App;
