// src/pages/Admin.jsx
import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Table,
  TableHead,
  TableBody,
  TableCell,
  TableRow,
  Paper,
  Alert,
  CircularProgress
} from '@mui/material';
import api from '../api/axios';

function Admin() {
  const [empleados, setEmpleados] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const cargarEmpleados = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/employees'); // 👈 SIN /api
      setEmpleados(res.data);
    } catch (err) {
      console.error('❌ Error al cargar empleados:', err);
      setError('No se pudo cargar la lista de empleados');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarEmpleados();
  }, []);

  const cerrarSesion = () => {
    localStorage.clear();
    window.location.href = '/';
  };

  return (
    <Box p={4}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Panel de Administración</Typography>
        <Button onClick={cerrarSesion} color="error" variant="outlined">
          Cerrar sesión
        </Button>
      </Box>

      <Button variant="contained" color="primary" sx={{ mb: 2 }}>
        + Agregar empleado
      </Button>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          ❌ {error}
        </Alert>
      )}

      {loading ? (
        <CircularProgress />
      ) : (
        <Paper>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Nombre</strong></TableCell>
                <TableCell><strong>Correo</strong></TableCell>
                <TableCell><strong>Teléfono</strong></TableCell>
                <TableCell><strong>Acciones</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {empleados.map((emp) => (
                <TableRow key={emp._id}>
                  <TableCell>{emp.nombre}</TableCell>
                  <TableCell>{emp.correo}</TableCell>
                  <TableCell>{emp.telefono || '—'}</TableCell>
                  <TableCell>
                    <Button size="small" color="primary" variant="outlined">
                      Editar
                    </Button>
                    <Button size="small" color="error" variant="outlined" sx={{ ml: 1 }}>
                      Eliminar
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {empleados.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    No hay empleados registrados.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Paper>
      )}
    </Box>
  );
}

export default Admin;
