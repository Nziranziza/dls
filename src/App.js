import Axios from "axios";
import { useEffect, useState, useCallback, useMemo } from "react";
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
            sch.availableSeats !== 0 && moment(sch.examStartDate).isAfter(moment())
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
        const dates = data?.filter((date) => moment(date.replaceAll('_', '-')).isAfter(moment()));
        for (const date of dates) {
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
  const distSelectorPlaceholders = useMemo(() => [
    Math.floor(Math.random() * 5) + 3,
    Math.floor(Math.random() * 5) + 3,
    Math.floor(Math.random() * 5) + 3
  ], [])
  return (
    <div>
      <header>
        <h1 className="text-center">Driving License</h1>
      </header>
      <main className="container">
        <div className="row">
          <div className="col-sm-3 position-relative d-none d-sm-block">
            <div className="sticky-top pt-2">
              <h3>Choose a district</h3>
              {uniqueDisticts.map((dist) => (
                <div class="form-check" id={dist}>
                  <input class="form-check-input" onChange={() => setDistrict(dist)} checked={dist === district} type="radio" name="flexRadioDefault" id={dist} />
                  <label class="form-check-label" for={dist}>
                    {dist}
                  </label>
                </div>
              ))}
              {loading && distSelectorPlaceholders.map((num) => <div class="form-check">
                <input class="form-check-input" type="radio" name="flexRadioDefault" />
                <p class="form-check-label placeholder-glow m-0">
                  <span className={`placeholder col-${num}`}></span>
                </p>
              </div>)}
            </div>
          </div>
          <div className="col-12 col-sm-6 position-relative">
            <div className="mb-3 sticky-top pt-2 bg-white d-sm-none">
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
              <hr className="mb-0" />
            </div>
            <ol className="list-group">
              {uniqueSchedules
                .filter(({ locationName }) => locationName === district)
                .map((sch, index) => (
                  <li key={index} className="list-group-item">
                    <div className="card my-2">
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
              {loading && <>
                {new Array(5).fill(0).map(() => <li className="list-group-item">
                  <div className="card my-2">
                    <div className="card-body">
                      <p className="card-text placeholder-glow">
                        <span className="placeholder col-7"></span>
                        <span className="placeholder col-4"></span>
                        <span className="placeholder col-4"></span>
                        <span className="placeholder col-6"></span>
                        <span className="placeholder col-8"></span>
                        <span className="placeholder col-7"></span>
                        <span className="placeholder col-4"></span>
                        <span className="placeholder col-4"></span>
                        <span className="placeholder col-6"></span>
                        <span className="placeholder col-8"></span>
                      </p>
                    </div>
                  </div>
                </li>
                )}
              </>}
            </ol>
            <div className="text-center">Using Irembo Public API</div>
            <div className="text-center">© {moment().format('YYYY')}</div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
