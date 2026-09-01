// src/services/authServices.js
import axios from "axios";

//const API_URL = "http://192.168.1.242:3000"; // sin doble slash final
const API_URL ="http://10.34.218.212:3000";
/**
 * Stores authentication data in localStorage.
 * @param {string} token - The authentication token.
 * @param {object} user - The user object.
 * @param {Array} roles - The user's roles.
 * @param {Array} permisosRaw - The user's raw permissions.
 */
export const saveAuthData = (token, user, roles, permisosRaw) => {
  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(user));
  localStorage.setItem("roles", JSON.stringify(roles));
  localStorage.setItem("permisos", JSON.stringify(permisosRaw));
};

/**
 * Loads authentication data from localStorage.
 * @returns {object|null} An object containing token, user, roles, and permisos, or null if not found.
 */
export const loadAuthData = () => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));
  const roles = JSON.parse(localStorage.getItem("roles"));
  const permisos = JSON.parse(localStorage.getItem("permisos")); // Using 'permisos' as stored by logout

  if (token && user && roles && permisos) {
    return { token, user, roles, permisos };
  }
  return null;
};

/**
 * payload: { rfc?: string, email?: string, password: string }
 * - Si se envía email, debe ser @unach.mx (el backend también lo valida).
 */
export const login = async (payload) => {
  // payload flexible
  const { data } = await axios.post(`${API_URL}/auth/login`, payload);

  // If login is successful, save the data to localStorage
  if (data.ok && data.token) {
    saveAuthData(data.token, data.usuario, data.roles, data.permisosRaw);
  }
  return data; // { ok, token, usuario, roles, permisosRaw? }
};

export const getPermisos = async (rfc) => {
  const token = localStorage.getItem("token") || "";
  const { data } = await axios.get(`${API_URL}/auth/permisos/${rfc}`, {
    headers: {
      Authorization: `Bearer ${token}`, // <-- IMPORTANTÍSIMO
    },
  });
  return data; // { ok, items: [...] }
};

export const logout = () => {
  localStorage.removeItem("user");
  localStorage.removeItem("token");
  localStorage.removeItem("permisos");
  localStorage.removeItem("roles");
  localStorage.removeItem("auth"); // si usas dashboard estudiante
};
