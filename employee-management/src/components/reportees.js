import React, { useState, useEffect, Fragment } from "react";
import randomcolor from "randomcolor";
import faker from "faker";
import "./reportees.css";
import axios from "axios";
import Grid from "@material-ui/core/Grid";
import { makeStyles } from "@material-ui/core/styles";
import ArrowBackIcon from "@material-ui/icons/ArrowBack";
import Button from "@material-ui/core/Button";
import { useHistory } from "react-router-dom";
import Avatar from "react-avatar";

const useStyles = makeStyles((theme) => ({
  margin: {
    margin: theme.spacing(1),
  },
  extendedIcon: {
    marginRight: theme.spacing(1),
  },
}));

const Card = (propss) => {
  console.log(propss);
  const levelColor = randomcolor();
  return (
    <Grid container spacing={1}>
      <Grid className="justify" item xs={12}>
        <ul>
          {propss.data.map((item) => (
            <Fragment key={item.id}>
              <li>
                <div className="card">
                  <div className="image">
                    <Avatar
                      maxInitials={1}
                      className="avatar"
                      size={40}
                      round={true}
                      name={item === undefined ? " " : item.firstName}
                    />
                    {/* <img
                      src={faker.image.avatar()}
                      alt="Profile"
                      style={{ borderColor: levelColor }}
                    /> */}
                  </div>
                  <div className="card-body">
                    <h4>{item.firstName}</h4>
                    <p>{item.departmentID}</p>
                  </div>
                  <div
                    className="card-footer"
                    style={{ background: levelColor }}
                  >
                    <img
                      src="https://www.flaticon.com/svg/static/icons/svg/2950/2950657.svg"
                      alt="Chat"
                    />
                    <img
                      src="https://www.flaticon.com/svg/static/icons/svg/1034/1034131.svg"
                      alt="Call"
                    />
                    <img
                      src="https://www.flaticon.com/svg/static/icons/svg/570/570387.svg"
                      alt="Video"
                    />
                  </div>
                  <div></div>
                </div>
                {item.reportees?.length && <Card data={item.reportees} />}
              </li>
            </Fragment>
          ))}
        </ul>
      </Grid>
    </Grid>
  );
};

const Reportees = (props) => {
  const classes = useStyles();
  const history = useHistory();
  const api = axios.create({
    baseURL: `https://localhost:5001/api`,
  });
  const handleClick = (e) => {
    console.log(e);
    history.push(`/`);
  };
  const [data, setData] = useState([]); //table data
  console.log(props);
  const {
    match: { params },
  } = props;
  useEffect(() => {
    api
      .get(`/employee/${params.id}`)
      .then((res) => {
        console.log("res");
        console.log(res);
        const arr = [];
        arr.push(res.data);
        setData(arr);
      })
      .catch((error) => {
        console.log("Error");
      });
  }, []);
  return (
    <div className="org-tree">
      <h1>Organization view</h1>
      <Button
        variant="contained"
        color="default"
        size="large"
        variant="contained"
        size="large"
        color="primary"
        className={classes.margin}
        onClick={handleClick}
        startIcon={<ArrowBackIcon />}
      >
        Back
      </Button>
      <Card data={data} />
    </div>
  );
};

export default Reportees;
