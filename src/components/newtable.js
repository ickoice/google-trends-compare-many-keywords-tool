import React, { useState } from 'react'
import 'bootstrap/dist/css/bootstrap.min.css';
import { FormControl, InputGroup, Form, Button } from 'react-bootstrap';
import axios from 'axios';



const Table = (props) => {
    const { headers, rows } = props;
    return (
        <div>
            <table className="table table-bordered table-hover">
                <TableHeader headers={headers}></TableHeader>
                <TableBody headers={headers} rows={rows}></TableBody>
            </table>
        </div>
    );
}

const TableHeader = (props) => {
    const { headers } = props;
    return (
        <thead className="thead-dark" key="header-1">
            <tr key="header-0">
                {headers && headers.map((value, index) => {
                    return <th key={index}><div>{value}</div></th>
                })}
            </tr>
        </thead>
    );
}


const TableBody = (props) => {
    const { headers, rows } = props;
    const columns = headers ? headers.length : 0;
    const showSpinner = rows === null;

    function buildRow(row, headers) {
        return (
            <tr key={row.keyword}>
                {headers.map((value, index) => {
                    return <td key={index}>{row[value]}</td>
                })}
            </tr>
        )
    };

    return (
        <tbody>
            {showSpinner &&
                <tr key="spinner-0">
                    <td colSpan={columns} className="text-center">
                        <div className="spinner-border" role="status">
                            <span className="sr-only"></span>
                        </div>
                    </td>
                </tr>
            }
            {!showSpinner && rows && rows.map((value) => {
                return buildRow(value, headers);
            })}
        </tbody>
    );
}


const AnotherTable = () => {
    const schema = {
        "keyword": "",
        "previousTimeframe": "",
        "currentTimeframe": "",
        "status": ""
    }
    const [data, setData] = useState(null);
    const [keywordsString, setKeywordsString] = useState("");
    const [previousStartDate, setPreviousStartDate] = useState("");
    const [previousEndDate, setPreviousEndDate] = useState("");
    const [currentStartDate, setCurrentStartDate] = useState("");
    const [currentEndDate, setCurrentEndDate] = useState("");

    const getTrendsData = () => {
        console.log(keywordsString);
        let keywordsArray = keywordsString.split(", ");
        const queryObject = {
            "keywords": keywordsArray,
            previousStartDate,
            previousEndDate,
            currentStartDate,
            currentEndDate
        };

        axios.post("http://localhost:5000/api", queryObject)
            .then(res => {
                console.log(res);

                let results = res.data;
                let filteredResults = [];
                for (var i = 0; i < results.symbols.length; i++) {
                    let currentObject = {
                        "keyword": results.symbols[i],
                        "currentTimeframe": results.currentTimeframe[i],
                        "previousTimeframe": results.previousTimeframe[i],
                        "status": results.previousTimeframe[i] < results.currentTimeframe[i] ? 'Higher' : 'Lower'
                    }
                    filteredResults.push(currentObject);

                }

                setData(filteredResults);


            });
    }

    return (
        <div className="container p-2">
            <div className="row align-items-center p-4">
                <div className="col-md-5">
                    <InputGroup>
                        <InputGroup.Text>Enter keywords</InputGroup.Text>
                        <FormControl value={keywordsString} onChange={e => setKeywordsString(e.target.value)} as="textarea" aria-label="With textarea" />
                    </InputGroup>
                </div>
                <div className="col-md-2">

                    <Form.Group controlId="dob">

                        <Form.Label>Select Previous Start Date</Form.Label>

                        <Form.Control value={previousStartDate} onChange={e => setPreviousStartDate(e.target.value)} type="date" name="dob" placeholder="Date of Birth" />

                    </Form.Group>

                    <Form.Group controlId="dob">

                        <Form.Label>Select Previous End Date</Form.Label>

                        <Form.Control value={previousEndDate} onChange={e => setPreviousEndDate(e.target.value)} type="date" name="dob" placeholder="Date of Birth" />

                    </Form.Group>
                </div>
                <div className="col-md-2">
                    <Form.Group controlId="dob">

                        <Form.Label>Select Current Start Date</Form.Label>

                        <Form.Control value={currentStartDate} onChange={e => setCurrentStartDate(e.target.value)} type="date" name="dob" placeholder="Date of Birth" />

                    </Form.Group>

                    <Form.Group controlId="dob">

                        <Form.Label>Select Current End Date</Form.Label>

                        <Form.Control value={currentEndDate} onChange={e => setCurrentEndDate(e.target.value)} type="date" name="dob" placeholder="Date of Birth" />

                    </Form.Group>
                </div>
                <div className="col-md-3">
                    <Button onClick={getTrendsData} variant="primary">Get Data</Button>
                </div>
            </div>

            <div className="row">
                <div className="col">
                    <Table headers={Object.keys(schema)} rows={data} />
                </div>
            </div>
        </div>
    )
}

export default AnotherTable
