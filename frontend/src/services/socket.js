import { io } from "socket.io-client";

let socket = null;

/**
 * Creates (or returns the existing) socket connection, authenticated with
 * the current JWT access token. Call disconnectSocket() on logout so a
 * stale connection doesn't linger with the old user's identity.
 */
export function getSocket() {
  if (socket) return socket;

  socket = io("/", {
    path: "/socket.io",
    // Function form (not a plain object) so socket.io-client calls this
    // fresh on every connection attempt, including automatic reconnects -
    // otherwise it would keep sending the token that was in localStorage
    // at the moment getSocket() was first called, forever. Access tokens
    // expire hourly; a reconnect after that (network blip, server
    // restart) would silently fail auth with a stale captured value.
    auth: (cb) => cb({ token: localStorage.getItem("access_token") }),
    autoConnect: true,
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: Infinity,
  });

  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

/**
 * If the access token was refreshed (e.g. after a 401 -> refresh cycle),
 * force a clean reconnect so the new connection - and any future
 * reconnect - authenticates with the current token. With the function-form
 * `auth` above this is a convenience/immediacy call more than a strict
 * requirement (a later automatic reconnect would pick up the fresh token
 * on its own), but calling it right after a refresh avoids a window where
 * the live connection is still tied to a token the server may reject on
 * its next check.
 */
export function reconnectSocketWithFreshToken() {
  disconnectSocket();
  return getSocket();
}
