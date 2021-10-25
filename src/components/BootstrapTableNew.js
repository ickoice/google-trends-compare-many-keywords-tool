import BootstrapTable from 'react-bootstrap-table-next';
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';
import React, { useState } from 'react'
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-bootstrap-table2-toolkit/dist/react-bootstrap-table2-toolkit.min.css';
import { FormControl, InputGroup, Form, Button } from 'react-bootstrap';
import axios from 'axios';
import ToolkitProvider, { CSVExport } from 'react-bootstrap-table2-toolkit';
const { ExportCSVButton } = CSVExport;
const columns = [{
    dataField: 'keyword',
    text: 'Keyword'
}, {
    dataField: 'previousTimeframe',
    text: 'Previous Timeframe',
    sort: true,
    sortFunc: (a, b, order, dataField, rowA, rowB) => {
        if (order === 'asc') {
            return b - a;
        }
        return a - b; // desc
    }
},
{
    dataField: 'currentTimeframe',
    text: 'Current Timeframe',
    sort: true,
    sortFunc: (a, b, order, dataField, rowA, rowB) => {
        if (order === 'asc') {
            return b - a;
        }
        return a - b; // desc
    }
},
{
    dataField: 'status',
    text: 'Status',
    sort: true,
    sortFunc: (a, b, order, dataField, rowA, rowB) => {
        if (order === 'asc') {
            return b.attr - a.attr;
        }
        return a.attr - b.attr; // desc
    }
}];


const BootstrapTableNew = () => {
    const [data, setData] = useState([]);
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

                setData(res.data);

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
                    <ToolkitProvider
                        keyField="keyword"
                        data={data}
                        columns={columns}
                        exportCSV
                    >
                        {
                            props => (
                                <div>
                                    <ExportCSVButton {...props.csvProps} style={{ "background": "blue", "color": "white" }}>Export CSV</ExportCSVButton>
                                    <hr />
                                    {/* <BootstrapTable keyField='keyword' data={data} columns={columns} /> */}

                                    <BootstrapTable {...props.baseProps} />
                                </div>
                            )
                        }
                    </ToolkitProvider>

                </div>
            </div >
        </div >
    )
}

export default BootstrapTableNew
