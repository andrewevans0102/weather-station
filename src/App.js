import React, { useState, useEffect } from "react";
import "./App.scss";
import { Subject, interval } from "rxjs";
import { takeUntil, catchError } from "rxjs/operators";
import axios from "axios";
import { Line } from "react-chartjs-2";
import moment from "moment";

function App() {
	const [temp, setTemp] = useState("0");
	const [humidity, setHumidity] = useState("0");
	const [NOAARecorded, setNOAARecorded] = useState("");
	const [weatherRecorded, setWeatherRecorded] = useState("");
	const [hourlyTemps, setHourlyTemps] = useState([]);
	const [hours, setHours] = useState([]);
	const [detailed, setDetailed] = useState([]);
	// 1000 ms X 60 X 5 = 5 minutes
	const intervalSeconds = 300000;
	// here is the function endpoint that is called to retrieve the weather information
	const resultsEndpoint = "<your_firebase_function_endpoint_here>";

	const data = {
		labels: hours,
		datasets: [
			{
				label: "Hourly Temps",
				borderColor: "blue",
				data: hourlyTemps,
			},
		],
	};

	const options = {
		title: {
			display: true,
		},
		scales: {
			yAxes: [
				{
					ticks: {
						suggestedMin: 0,
						suggestedMax: 100,
					},
				},
			],
		},
	};

	useEffect(() => {
		const weatherTimer = interval(intervalSeconds);
		const unsubscribe$ = new Subject();
		const weatherObservable = weatherTimer.pipe(
			takeUntil(unsubscribe$),
			catchError((error) => {
				throw error;
			})
		);
		unsubscribe$.subscribe();
		weatherObservable.subscribe(async () => {
			axios
				.get(resultsEndpoint)
				.then((response) => {
					// weather
					setTemp(response.data.temp);
					setHumidity(response.data.humidity);
					setWeatherRecorded(response.data.weatherRecorded);

					// NOAA
					setDetailed(response.data.detailed);
					setNOAARecorded(response.data.NOAARecorded);
					const temps = [];
					const tempsHours = [];
					response.data.hourly.forEach((value) => {
						temps.push(value.temperature);
						const startTime = moment(value.startTime);
						tempsHours.push(startTime.format("h a"));
					});
					setHourlyTemps(temps);
					setHours(tempsHours);
				})
				.catch((error) => {
					console.log(`error when calling local server with ${error}`);
					return;
				});
		});
		return () => {
			unsubscribe$.next();
			unsubscribe$.complete();
		};
	}, []);

	return (
		<main>
			<section className="weather">
				<h1 className="weather__title">Weather Station</h1>
				<div className="weather__output">
					<div className="weather__output--results">
						<p className="weather__temp">Temp: {temp}&#176;</p>
						<p className="weather__humidity">Humidity: {humidity}%</p>

						<div className="weather__noaa">
							<div>
								<p>{detailed[0]?.name}</p>
								<p>{detailed[0]?.detailedForecast}</p>
							</div>
							<div>
								<p>{detailed[1]?.name}</p>
								<p>{detailed[1]?.detailedForecast}</p>
							</div>
							<div>
								<p>{detailed[2]?.name}</p>
								<p>{detailed[2]?.detailedForecast}</p>
							</div>
							<div>
								<p>{detailed[3]?.name}</p>
								<p>{detailed[3]?.detailedForecast}</p>
							</div>
						</div>
					</div>
					<div className="weather__chart">
						<Line data={data} options={options} />
						<div className="weather__time">
							<p className="weather__time--retrieved">
								Weather Recorded: {weatherRecorded}
							</p>
							<p className="weather__time--retrieved">
								NOAA Recorded: {NOAARecorded}
							</p>
						</div>
					</div>
				</div>
			</section>
		</main>
	);
}

export default App;
