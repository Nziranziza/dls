import Axios from "axios";
import { useEffect, useState, useCallback } from "react";
import moment from "moment";

import "./App.css";

const axios = Axios.create({
  baseURL: "https://irembo.gov.rw/irembo/rest/public/police/request/dl-schedules/",
  headers: {
    scheduleExamType: "PRACTICAL",
    scheduleExamFormat: "PRACTICAL",
    examFormat: "PRACTICAL",
    examType: "PRACTICAL",
    SAT: "00673&r1b6e6hMtckZUAdlFk_S8DyM7CcyKKiaIZDXAW-q_DQ&eyJvcmlnaW4iOiJodHRwczovL2lyZW1iby5nb3YucnciLCJpYXQiOjE2ODA3NzM4MjE3MTIsImV4cCI6IjIwMjMtMDQtMDZUMDk6Mzc6MDcuNzEyWiJ9&eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9",
    NLS: "Kinyarwanda",
    "Access-Control-Allow-Origin": "*",
  },
});

function App() {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [district, setDistrict] = useState('Kicukiro');

  const getSchedules = useCallback(async (date) => {
    try {
      const {
        data: {
          data: { dlExamSchedules },
        },
      } = await axios.get("by-date", {
        headers: {
          scheduleDate: date,
        },
      });
      setSchedules((schedules) => [
        ...schedules,
        ...dlExamSchedules.filter(
          (sch) =>
            sch.dlDrivingLicenseCategoryId === 1 &&
            sch.availableSeats !== 0
        ),
      ]);
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    axios
      .get("dates")
      .then(async ({ data: { data } }) => {
        for (const date of data.slice(98)) {
          await getSchedules(date);
        }
        setLoading(false);
      })
      .catch(console.log);
  }, [getSchedules]);


  const settedSchedules = new Set(schedules.map(({ id }) => id));
  const uniqueSchedules = Array.from(settedSchedules).map((i) =>
    schedules.find((sch) => sch.id === i)
  );
  const settedDistricts = new Set(
    uniqueSchedules.map(({ locationName }) => locationName)
  );
  const uniqueDisticts = Array.from(settedDistricts).sort();

  return (
    <div>
      <header>
        <h1 className="text-center">Driving License</h1>
      </header>
      <main className="container">
        <div className="row">
          <div className="col-12 col-sm-6 position-relative">
            <div className="ms-4 ps-1 mb-4 sticky-top">
              <select
                className="form-select"
                onChange={(e) => setDistrict(e.target.value)}
                value={district}
              >
                <option>Select a district</option>
                {uniqueDisticts.map((dist) => (
                  <option key={dist} value={dist}>
                    {dist}
                  </option>
                ))}
              </select>
            </div>
            <ol>
              {uniqueSchedules
                .filter(({ locationName }) => locationName === district)
                .map((sch, index) => (
                  <li key={index}>
                    <div className="card mb-3">
                      <div className="card-body">
                        <h5 className="card-title">{sch.locationName}</h5>
                        <table className="table table-hover">
                          <tbody>
                            <tr>
                              <td><span className="fw-bolder">Available Seats:</span></td>
                              <td>{sch.availableSeats}</td>
                            </tr>
                            <tr>
                              <td><span className="fw-bolder">Used seats:</span></td>
                              <td>{sch.usedSeats}</td>
                            </tr>
                            <tr>
                              <td><span className="fw-bolder">Max Capacity:</span></td>
                              <td>{sch.maxCapacity}</td>
                            </tr>
                            <tr>
                              <td><span className="fw-bolder">Exam Center:</span></td>
                              <td>{sch.examCenters.map(({ name }) => name)}</td>
                            </tr>
                            <tr>
                              <td><span className="fw-bolder">Start Date:</span></td>
                              <td>{moment(sch.examStartDate).format("Do MMM YYYY hh:mm")}</td>
                            </tr>
                            <tr>
                              <td><span className="fw-bolder">End Date:</span></td>
                              <td>{moment(sch.examEndDate).format("Do MMM YYYY hh:mm")}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </li>
                ))}
            </ol>
            {loading && <div className="text-center">Loading...</div>}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
