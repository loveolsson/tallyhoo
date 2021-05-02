"use strict";

let ws;

function connected() {
    console.log("Connected");
}

function disconnected() {
    ws?.close();
    ws = undefined;

    setTimeout(connect, 2000);
}

function message(buf) {
    try {
        const msg = JSON.parse(buf);
        console.log(msg);
    } catch (e) {
        console.error(e);
    }
}

function connect() {
    ws = new WebSocket(`ws://${location.host}`);
    ws.addEventListener("open", connected);
    ws.addEventListener("close", disconnected);
    ws.addEventListener("message", message);
}

function page_load() {
    connect();
}

window.addEventListener("load", page_load);