import React, { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import dbManagerInstance from "../utils/DbManager";

function SQLBrowser() {
  const [query, setQuery] = useState("SELECT * FROM vallu.tirukkural limit 10");
  const [results, setResults] = useState([]);
  const [error, setError] = useState(null);

  const handleQueryChange = (event) => {
    setQuery(event.target.value);
  };

  const executeQuery = async () => {
    try {
      const conn = await dbManagerInstance.db.connect();
      const result = await conn.query(query);
      setResults(result.toArray());
      setError(null);
      await conn.close();
    } catch (err) {
      setError("Error executing query: " + err.message);
    }
  };

  return (
    <Box sx={{ my: 2 }}>
      <TextField
        label="SQL Query"
        variant="outlined"
        fullWidth
        placeholder="SELECT * FROM vallu.tirukkural"
        value={query}
        onChange={handleQueryChange}
        multiline
        rows={4}
      />
      <Button
        variant="contained"
        color="primary"
        onClick={executeQuery}
        sx={{ mt: 2 }}
      >
        Execute
      </Button>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>kno</TableCell>
              <TableCell>pal</TableCell>
              <TableCell>iyal</TableCell>
              <TableCell>title</TableCell>
              <TableCell>heading</TableCell>
              <TableCell>chapter</TableCell>
              <TableCell>tchapter</TableCell>
              <TableCell>efirstline</TableCell>
              <TableCell>esecondline</TableCell>
              <TableCell>firstline</TableCell>
              <TableCell>secondline</TableCell>
              <TableCell>explanation</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {results.map((row, index) => (
              <TableRow key={index}>
                <TableCell>{parseInt(row.kno)}</TableCell>
                <TableCell>{row.pal}</TableCell>
                <TableCell>{row.iyal}</TableCell>
                <TableCell>{row.title}</TableCell>
                <TableCell>{row.heading}</TableCell>
                <TableCell>{row.chapter}</TableCell>
                <TableCell>{row.tchapter}</TableCell>
                <TableCell>{row.efirstline}</TableCell>
                <TableCell>{row.esecondline}</TableCell>
                <TableCell>{row.firstline}</TableCell>
                <TableCell>{row.secondline}</TableCell>
                <TableCell>{row.explanation}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

export default SQLBrowser;
