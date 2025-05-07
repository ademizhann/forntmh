// Изменённый MyTestsPage с зелёной шапкой таблицы

import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../api/axios";
import {
  Box,
  Typography,
  Paper,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TablePagination,
  CircularProgress,
  GlobalStyles,
  styled,
  Chip,
  Avatar,
  Stack,
  IconButton
} from "@mui/material";
import { ShoppingBag, ArrowBack } from "@mui/icons-material";

const BG = { background: "#f0f2f5" };
const statusColor = {
  pending: "warning",
  processing: "warning",
  completed: "success",
  rejected: "error"
};
const currency = new Intl.NumberFormat(undefined, {
  style: "currency",
  currency: "KZT",
  maximumFractionDigits: 0
});

const HeadCell = styled(TableCell)(({ theme }) => ({
  fontWeight: 700,
  background: theme.palette.success.main,
  color: theme.palette.common.white,
  position: "sticky",
  top: 0,
  zIndex: 2
}));

export default function MyTestsPage() {
  const nav = useNavigate();
  const loc = useLocation();

  const [records, setRecords] = useState([]);
  const [fresh, setFresh] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [page, setPage] = useState(0);
  const [rows, setRows] = useState(5);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const { data } = await api.get("/analysis/records/");
        const list = Array.isArray(data)
          ? data
          : Array.isArray(data.results)
            ? data.results
            : Array.isArray(data.data)
              ? data.data
              : [];
        setRecords(list);
        setFresh(
          Array.isArray(loc.state?.newRecords)
            ? loc.state.newRecords
            : list.slice(0, 3)
        );
        setError(null);
      } catch (e) {
        console.error(e);
        setError("Failed to load test records");
      } finally {
        setLoading(false);
      }
    })();
  }, [loc.state]);

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "60vh"
        }}
      >
        <CircularProgress />
      </Box>
    );
  }
  if (error) {
    return (
      <Box sx={{ p: 4, textAlign: "center" }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <>
      <GlobalStyles styles={{ body: { backgroundColor: BG.background } }} />
      <Box sx={{ maxWidth: 1400, mx: "auto", p: { xs: 2, md: 6 } }}>
        {/* Header */}
        <Box sx={{ mb: 4, display: "flex", alignItems: "center", gap: 1 }}>
          <IconButton onClick={() => nav(-1)}>
            <ArrowBack />
          </IconButton>
          <Avatar sx={{ bgcolor: "success.main", mr: 1 }}>
            <ShoppingBag />
          </Avatar>
          <Typography variant="h4" fontWeight={700}>
            My Medical Tests
          </Typography>
        </Box>


        {fresh.length > 0 && (
          <Paper elevation={3} sx={{ mb: 4, borderRadius: 2 }}>
            <Box sx={{ p: 2, borderBottom: 1, borderColor: "divider" }}>
              <Typography variant="h6" fontWeight={600}>
                Recent Tests ({fresh.length})
              </Typography>
            </Box>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <HeadCell>Test</HeadCell>
                    <HeadCell align="center">Date & Time</HeadCell>
                    <HeadCell align="right">Price</HeadCell>
                    <HeadCell align="center">Status</HeadCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {fresh.map((r) => (
                    <TableRow
                      key={r.id}
                      sx={{
                        "&:nth-of-type(odd)": { backgroundColor: "action.hover" }
                      }}
                    >
                      <TableCell>{r.analysis?.title || "—"}</TableCell>
                      <TableCell align="center">
                        {r.test_date
                          ? new Date(r.test_date).toLocaleString()
                          : "-"}
                      </TableCell>
                      <TableCell align="right">
                        {currency.format(r.analysis?.price || 0)}
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={r.status}
                          color={statusColor[r.status]}
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        )}

        <Paper elevation={3} sx={{ borderRadius: 2 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  {[
                    "Test",
                    "Hospital",
                    "Date & Time",
                    "Notes",
                    "Result",
                    "Status",
                    "Reviewed at"
                  ].map((h) => (
                    <HeadCell
                      key={h}
                      align={
                        ["Notes", "Result"].includes(h) ? "left" : "center"
                      }
                    >
                      {h}
                    </HeadCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {records
                  .slice(page * rows, page * rows + rows)
                  .map((r) => (
                    <TableRow
                      key={r.id}
                      hover
                      sx={{
                        "&:nth-of-type(odd)": { backgroundColor: "action.hover" },
                        transition: "background .3s",
                        "&:hover": { backgroundColor: "action.selected" }
                      }}
                    >
                      <TableCell>{r.analysis?.title || "—"}</TableCell>
                      <TableCell align="center">
                        {r.hospital?.name || "-"}
                      </TableCell>
                      <TableCell align="center">
                        {r.test_date
                          ? new Date(r.test_date).toLocaleString()
                          : "-"}
                      </TableCell>
                      <TableCell>{r.notes || "-"}</TableCell>
                      <TableCell>{r.result || "-"}</TableCell>
                      <TableCell align="center">
                        <Chip
                          label={r.status}
                          color={statusColor[r.status]}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="center">
                        {r.reviewed_at
                          ? new Date(r.reviewed_at).toLocaleString()
                          : "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                {records.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      No records
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            rowsPerPageOptions={[5, 10, 25]}
            count={records.length}
            rowsPerPage={rows}
            page={page}
            onPageChange={(_, p) => setPage(p)}
            onRowsPerPageChange={(e) => {
              setRows(+e.target.value);
              setPage(0);
            }}
            sx={{
              ".MuiTablePagination-toolbar": {
                paddingLeft: 2,
                paddingRight: 2
              }
            }}
          />
        </Paper>
      </Box>
    </>
  );
}