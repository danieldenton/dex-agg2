"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importDefault(require("react"));
var Spinner_1 = __importDefault(require("react-bootstrap/Spinner"));
var Loading = function () {
    return (react_1.default.createElement("div", { className: 'text-center my-5' },
        react_1.default.createElement(Spinner_1.default, { animation: "grow" }),
        react_1.default.createElement("p", { className: 'my-2' }, "Loading Data...")));
};
exports.default = Loading;
