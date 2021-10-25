// src/components/filter.table.js
import React, { useEffect, useState } from "react";
import axios from 'axios';

import { useTable, useFilters, useGlobalFilter, useAsyncDebounce } from 'react-table'
import 'bootstrap/dist/css/bootstrap.min.css';
import { FormControl, InputGroup, Form, Button } from 'react-bootstrap';


// Define a default UI for filtering
function GlobalFilter({
    preGlobalFilteredRows,
    globalFilter,
    setGlobalFilter,
}) {
    const count = preGlobalFilteredRows.length
    const [value, setValue] = React.useState(globalFilter)
    const onChange = useAsyncDebounce(value => {
        setGlobalFilter(value || undefined)
    }, 200)

    return (
        <span>
            Search:{' '}
            <input
                className="form-control"
                value={value || ""}
                onChange={e => {
                    setValue(e.target.value);
                    onChange(e.target.value);
                }}
                placeholder={`${count} records...`}
            />
        </span>
    )
}

function DefaultColumnFilter({
    column: { filterValue, preFilteredRows, setFilter },
}) {
    const count = preFilteredRows.length

    return (
        <input
            className="form-control"
            value={filterValue || ''}
            onChange={e => {
                setFilter(e.target.value || undefined)
            }}
            placeholder={`Search ${count} records...`}
        />
    )
}

function Table({ columns, data }) {

    const defaultColumn = React.useMemo(
        () => ({
            // Default Filter UI
            Filter: DefaultColumnFilter,
        }),
        []
    )

    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        rows,
        prepareRow,
        state,
        preGlobalFilteredRows,
        setGlobalFilter,
    } = useTable(
        {
            columns,
            data,
            defaultColumn
        },
        useFilters,
        useGlobalFilter
    )

    return (
        <div>
            <GlobalFilter
                preGlobalFilteredRows={preGlobalFilteredRows}
                globalFilter={state.globalFilter}
                setGlobalFilter={setGlobalFilter}
            />
            <table className="table" {...getTableProps()}>
                <thead>
                    {headerGroups.map(headerGroup => (
                        <tr {...headerGroup.getHeaderGroupProps()}>
                            {headerGroup.headers.map(column => (
                                <th {...column.getHeaderProps()}>
                                    {column.render('Header')}
                                    {/* Render the columns filter UI */}
                                    <div>{column.canFilter ? column.render('Filter') : null}</div>
                                </th>
                            ))}
                        </tr>
                    ))}
                </thead>
                <tbody {...getTableBodyProps()}>
                    {rows.map((row, i) => {
                        prepareRow(row)
                        return (
                            <tr {...row.getRowProps()}>
                                {row.cells.map(cell => {
                                    return <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
                                })}
                            </tr>
                        )
                    })}
                </tbody>
            </table>
            <br />
            <div>Showing the first 20 results of {rows.length} rows</div>
            <div>
                <pre>
                    <code>{JSON.stringify(state.filters, null, 2)}</code>
                </pre>
            </div>
        </div>
    )
}



function FilterTableComponent() {
    const [keywordsString, setKeywordsString] = useState("");
    const [previousStartDate, setPreviousStartDate] = useState("");
    const [previousEndDate, setPreviousEndDate] = useState("");
    const [currentStartDate, setCurrentStartDate] = useState("");
    const [currentEndDate, setCurrentEndDate] = useState("");

    const columns = React.useMemo(
        () => [

            {
                Header: 'Statistics',
                columns: [
                    {
                        Header: 'Keyword',
                        accessor: 'keyword',
                    },
                    {
                        Header: 'Previous Timeframe',
                        accessor: 'previousTimeframe'
                    },
                    {
                        Header: 'Current Timeframe',
                        accessor: 'currentTimeframe'
                    },
                    {
                        Header: 'Status',
                        accessor: 'status'
                    },
                ],
            },
        ],
        []
    )

    let data = [

    ]


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
                        "status": results.previousTimeframe[i] > results.currentTimeframe[i] ? 'Higher' : 'Lower'
                    }
                    filteredResults.push(currentObject);

                }

                data = filteredResults;


            });
    }


    return (
        <div>
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

                <Table columns={columns} data={data} />
            </div>
        </div>
    )
}

export default FilterTableComponent;