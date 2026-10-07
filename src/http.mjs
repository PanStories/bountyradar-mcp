#!/usr/bin/env node
// http.mjs — BountyRadar Apify entry (Standby-safe).
// The main process binds the HTTP port itself (NO actor.json `webServer` delegation —
// that pattern never binds the port in Standby and gets the container killed).
// Apify injects ACTOR_WEB_SERVER_PORT for Standby actors; we fall back gracefully.
import { startServer } from './handler.mjs';

startServer();
