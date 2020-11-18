import React, { useState, useEffect } from "react";
import "./App.css";
import { forwardRef } from "react";
import Avatar from "react-avatar";
import Grid from "@material-ui/core/Grid";

import MaterialTable from "material-table";
import AddBox from "@material-ui/icons/AddBox";
import ArrowDownward from "@material-ui/icons/ArrowDownward";
import Check from "@material-ui/icons/Check";
import ChevronLeft from "@material-ui/icons/ChevronLeft";
import ChevronRight from "@material-ui/icons/ChevronRight";
import Clear from "@material-ui/icons/Clear";
import DeleteOutline from "@material-ui/icons/DeleteOutline";
import Edit from "@material-ui/icons/Edit";
import FilterList from "@material-ui/icons/FilterList";
import FirstPage from "@material-ui/icons/FirstPage";
import LastPage from "@material-ui/icons/LastPage";
import Remove from "@material-ui/icons/Remove";
import SaveAlt from "@material-ui/icons/SaveAlt";
import Search from "@material-ui/icons/Search";
import ViewColumn from "@material-ui/icons/ViewColumn";
import axios from "axios";
import Alert from "@material-ui/lab/Alert";
import { useHistory } from "react-router-dom";
import { CropLandscapeOutlined } from "@material-ui/icons";

const tableIcons = {
  Add: forwardRef((props, ref) => <AddBox {...props} ref={ref} />),
  Check: forwardRef((props, ref) => <Check {...props} ref={ref} />),
  Clear: forwardRef((props, ref) => <Clear {...props} ref={ref} />),
  Delete: forwardRef((props, ref) => <DeleteOutline {...props} ref={ref} />),
  DetailPanel: forwardRef((props, ref) => (
    <ChevronRight {...props} ref={ref} />
  )),
  Edit: forwardRef((props, ref) => <Edit {...props} ref={ref} />),
  Export: forwardRef((props, ref) => <SaveAlt {...props} ref={ref} />),
  Filter: forwardRef((props, ref) => <FilterList {...props} ref={ref} />),
  FirstPage: forwardRef((props, ref) => <FirstPage {...props} ref={ref} />),
  LastPage: forwardRef((props, ref) => <LastPage {...props} ref={ref} />),
  NextPage: forwardRef((props, ref) => <ChevronRight {...props} ref={ref} />),
  PreviousPage: forwardRef((props, ref) => (
    <ChevronLeft {...props} ref={ref} />
  )),
  ResetSearch: forwardRef((props, ref) => <Clear {...props} ref={ref} />),
  Search: forwardRef((props, ref) => <Search {...props} ref={ref} />),
  SortArrow: forwardRef((props, ref) => <ArrowDownward {...props} ref={ref} />),
  ThirdStateCheck: forwardRef((props, ref) => <Remove {...props} ref={ref} />),
  ViewColumn: forwardRef((props, ref) => <ViewColumn {...props} ref={ref} />),
};

const api = axios.create({
  baseURL: `https://localhost:5001/api`,
});

function App() {
  const history = useHistory();
  const [columns, setColumnData] = useState([]); //table data
  const [data, setData] = useState([]); //table data
  const [departmentData, setDepartmentdata] = useState([]); //department data
  // const [managerData, setManagerData] = useState([]); //manager data

  //for error handling
  const [iserror, setIserror] = useState(false);
  const [errorMessages, setErrorMessages] = useState([]);

  useEffect(() => {
    const handleClick = (e) => {
      console.log(e);
      history.push(`/reportees/${e.target.textContent}`);
    };
    api
      .get("/department")
      .then((resp) => {
        const dep = Array.from(resp.data);
        setDepartmentdata(dep);
        console.log(departmentData);
        const depMapped = dep
          .slice()
          .reduce((acc, cur) => ({ ...acc, [cur.id]: cur.name }), {});
        console.log(depMapped);
        api
          .get("/employee")
          .then((res) => {
            console.log(res.data);
            const emps = Array.from(res.data);
            setData(emps);
            const managers = emps
              .slice()
              .reduce((acc, cur) => ({ ...acc, [cur.id]: cur.firstName }), {});
            const col = [
              { title: "id", field: "id", hidden: true },

              { title: "First name", field: "firstName" },
              { title: "Last name", field: "lastName" },
              { title: "Address", field: "address" },
              {
                title: "department",
                field: "departmentID",
                type: "numeric",
                lookup: { ...depMapped },
              },
              {
                title: "Manager",
                field: "managerID",
                validate: (rowData) =>
                  rowData.departmentID ===
                  data.some(
                    (x) =>
                      x.managerID == rowData.managerID &&
                      x.departmentID == rowData.departmentID
                  )
                    ? {
                        isValid: true,
                        helperText: "Manager department should be same",
                      }
                    : true,
                lookup: { ...managers },
                render: (rowData) => (
                  <div>
                    {rowData !== undefined &&
                      rowData !== null &&
                      rowData.managerID !== undefined &&
                      rowData.managerID !== null && (
                        <Avatar
                          className="avatar"
                          size={40}
                          round={true}
                          onClick={handleClick}
                          value={
                            rowData === undefined || rowData === null
                              ? " "
                              : String(rowData.managerID)
                          }
                        />
                      )}
                  </div>
                ),
              },

              { title: "DOJ", field: "doj", type: "date" },
            ];
            setColumnData(col);
          })
          .catch((error) => {
            console.log("Error");
          });
      })
      .catch((error) => {
        console.log("Error");
      });
  }, []);

  const handleRowUpdate = (newData, oldData, resolve) => {
    //validation
    let errorList = [];
    if (newData.firstName === "") {
      errorList.push("Please enter first name");
    }
    if (newData.lastName === "") {
      errorList.push("Please enter last name");
    }

    if (newData.departmentID === undefined) {
      errorList.push("Please select department");
    }

    if (
      newData.managerID !== undefined &&
      !data.some(
        (x) =>
          x.departmentID == newData.departmentID && x.id == newData.managerID
      )
    ) {
      errorList.push("Manager should be same department");
    }
    if (errorList.length < 1) {
      newData.departmentID = Number(newData.departmentID);
      newData.managerID = Number(newData.managerID);
      api
        .patch("/employee/" + newData.id, newData)
        .then((res) => {
          const dataUpdate = [...data];
          const index = oldData.tableData.id;
          dataUpdate[index] = newData;
          setData([...dataUpdate]);
          resolve();
          setIserror(false);
          setErrorMessages([]);
        })
        .catch((error) => {
          setErrorMessages(["Update failed! Server error"]);
          setIserror(true);
          resolve();
        });
    } else {
      setErrorMessages(errorList);
      setIserror(true);
      resolve();
    }
  };

  const handleRowAdd = (newData, resolve) => {
    //validation
    let errorList = [];
    if (newData.firstName === undefined) {
      errorList.push("Please enter first name");
    }
    if (newData.lastName === undefined) {
      errorList.push("Please enter last name");
    }

    if (newData.departmentID === undefined) {
      errorList.push("Please select department");
    }
    console.log(newData.managerID);
    if (
      newData.managerID !== undefined &&
      !data.some(
        (x) =>
          x.departmentID == newData.departmentID && x.id == newData.managerID
      )
    ) {
      errorList.push("Manager should be same department");
    }
    if (errorList.length < 1) {
      //no error
      newData.departmentID = Number(newData.departmentID);
      newData.managerID = Number(newData.managerID);
      api
        .post("/employee", newData)
        .then((res) => {
          let dataToAdd = [...data];
          dataToAdd.push(newData);
          setData(dataToAdd);
          resolve();
          setErrorMessages([]);
          setIserror(false);
        })
        .catch((error) => {
          setErrorMessages(["Cannot add data. Server error!"]);
          setIserror(true);
          resolve();
        });
    } else {
      setErrorMessages(errorList);
      setIserror(true);
      resolve();
    }
  };

  const handleRowDelete = (oldData, resolve) => {
    api
      .delete("/employee/" + oldData.id)
      .then((res) => {
        const dataDelete = [...data];
        const index = oldData.tableData.id;
        dataDelete.splice(index, 1);
        setData([...dataDelete]);
        resolve();
      })
      .catch((error) => {
        setErrorMessages(["Delete failed! Server error"]);
        setIserror(true);
        resolve();
      });
  };

  return (
    <div className="App">
      <Grid container spacing={1}>
        <Grid item xs={1}></Grid>
        <Grid item xs={10}>
          <div>
            {iserror && (
              <Alert severity="error">
                {errorMessages.map((msg, i) => {
                  return <div key={i}>{msg}</div>;
                })}
              </Alert>
            )}
          </div>
          <MaterialTable
            title="Employee Management"
            columns={columns}
            data={data}
            icons={tableIcons}
            editable={{
              onRowUpdate: (newData, oldData) =>
                new Promise((resolve) => {
                  handleRowUpdate(newData, oldData, resolve);
                }),
              onRowAdd: (newData) =>
                new Promise((resolve) => {
                  handleRowAdd(newData, resolve);
                }),
              onRowDelete: (oldData) =>
                new Promise((resolve) => {
                  handleRowDelete(oldData, resolve);
                }),
            }}
          />
        </Grid>
        <Grid item xs={1}></Grid>
      </Grid>
    </div>
  );
}

export default App;
