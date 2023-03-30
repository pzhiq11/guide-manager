"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TutorialManager = exports.FinishType = exports.TutorialEventType = void 0;
var esm_1 = require("@pzhiq/esm");
var localStorage_1 = require("./localStorage");
var TutorialEventType;
(function (TutorialEventType) {
    TutorialEventType[TutorialEventType["MxEvent"] = 0] = "MxEvent";
    TutorialEventType[TutorialEventType["MxStore"] = 1] = "MxStore";
    TutorialEventType[TutorialEventType["ModelShow"] = 2] = "ModelShow";
    // ModelHide,
})(TutorialEventType = exports.TutorialEventType || (exports.TutorialEventType = {}));
var FinishType;
(function (FinishType) {
    FinishType[FinishType["FinishEvts"] = 0] = "FinishEvts";
})(FinishType = exports.FinishType || (exports.FinishType = {}));
function getFormatDate() {
    var date = new Date();
    return "".concat(date.getFullYear(), "-").concat(date.getMonth(), "-").concat(date.getDate());
}
function isToday(s) {
    return s === getFormatDate();
}
var TutorialManager = /** @class */ (function () {
    function TutorialManager() {
        var _this = this;
        this.storageData = {};
        /** 顺序教学队列 */
        this.sequenceQueue = [];
        /** 事件教学map */
        this.eventMap = {};
        /** 事件教学取消map */
        this.finalizeMap = {};
        /** 被隐藏教学队列 */
        this.tutStatck = [];
        /**
         * 更新顺序教学
         * @returns
         */
        this.update = function () {
            // this.judgeCurTutCanContinue();÷
            if (_this.nextWaitTime > 0) {
                return;
            }
            if (_this.sequenceQueue.length === 0)
                return;
            // 当前有教学时不更新顺序教学
            // if (this.currentTut && this.currentTut.running) {
            //   return;
            // }
            // 当前被压入栈中有教学时不更新顺序教学
            if (_this.tutStatck.length > 0)
                return;
            var tutInst = _this.getNextSeqTutorial();
            if (!tutInst || tutInst.running)
                return;
            // 顺序教学是否会被高优先级事件教学顶掉
            if (!_this.isPiro(tutInst))
                return;
            // if (mx.store.get(StoreName.Is_layer_on_show) || mx.store.get(StoreName.Is_modal_on_show)) return;
            // @ts-ignore
            // if (window?.__POP_MANAGER__?.queue?.current) return;
            var ts = tutInst.ts;
            if (!ts.canStart || ts.canStart()) {
                console.log('教学管理器 start 教学====');
                _this.startTutorial(tutInst);
            }
        };
        this._waitLoadPromise = new Promise(function (resolve) {
            _this._resolve = resolve;
        });
    }
    TutorialManager.prototype.waitLoad = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this._waitLoadPromise];
            });
        });
    };
    /**
     * 初始化教学，开启顺序教学
     * @param interval number 循序教学查询间隔时间
     * @param storageName string 存储教学信息storageName
     */
    TutorialManager.prototype.init = function (interval, storageName) {
        if (interval === void 0) { interval = 1000; }
        if (storageName === void 0) { storageName = '__tutorial__1111'; }
        return __awaiter(this, void 0, void 0, function () {
            var error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, (0, localStorage_1.getUserId)()];
                    case 1:
                        _a.sent();
                        this.storageName = storageName;
                        this.interval = interval;
                        // TODO 测试记得删
                        //   const clearTutStorage = getQuery('clearTutStorage');
                        //   if (clearTutStorage) {
                        //     setStorage(storageName, '');
                        //   }
                        // 加载本地教学信息
                        this.load(this.storageName);
                        // 开启教学循环
                        this.handler = setInterval(this.update, this.interval);
                        return [3 /*break*/, 3];
                    case 2:
                        error_1 = _a.sent();
                        console.log(error_1);
                        return [3 /*break*/, 3];
                    case 3:
                        this._resolve();
                        return [2 /*return*/];
                }
            });
        });
    };
    TutorialManager.prototype.setUserId = function (id) {
        (0, localStorage_1._setUserId)(id);
    };
    /**
     * 教学是否可以跳过
     * @param ts
     * @returns
     */
    TutorialManager.prototype.canJump = function (ts) {
        var _a;
        if (ts.onlyOnce && this.hasFinished(ts.name)) {
            return true;
        }
        if (ts.onceOneDay && isToday((_a = this.storageData[ts.name]) === null || _a === void 0 ? void 0 : _a.date)) {
            return true;
        }
        if (ts.timesOneDay && this.todayTimesOut(ts)) {
            return true;
        }
        if (ts.canJumpOver) {
            return ts.canJumpOver();
            // 自动跳过不能开始的教学，若不想跳过，需要实现canJumpOver方法
        }
        else if (ts.canStart && !ts.canStart() && (!ts.canFinish || ts.canFinish())) {
            return true;
        }
        return false;
    };
    /**
     * 获取下一个顺序教学实例
     * @returns
     */
    TutorialManager.prototype.getNextSeqTutorial = function () {
        if (this.sequenceQueue.length === 0)
            return;
        var tutInst = this.sequenceQueue[0];
        if (!tutInst) {
            this.sequenceQueue.unshift();
            return this.getNextSeqTutorial();
        }
        if (tutInst.running) {
            return tutInst;
        }
        var ts = tutInst.ts;
        if (this.canJump(ts)) {
            this.cancelTutorial(ts.name);
            return this.getNextSeqTutorial();
        }
        return tutInst;
    };
    /**
     * 加载顺序教学
     * @param finishEvts
     * @param ts
     * @returns
     */
    TutorialManager.prototype.addSequenceTutorial = function (finishEvts, ts) {
        var _this = this;
        if (this.finalizeMap[ts.name] || this.eventMap[ts.name]) {
            console.error('不能添加重复的名字', ts);
            return;
        }
        console.log('addSequenceTutorial===', ts.name);
        var tutInst = {
            running: false,
            finished: false,
            index: ts.index || 10,
            loopNum: 0,
            ts: ts,
        };
        var registerFinishEvts = function () {
            return _this._registerEvent(finishEvts, function () {
                try {
                    if (!tutInst.running || tutInst.finished) {
                        return;
                    }
                    if (ts.canFinish && !ts.canFinish()) {
                        return;
                    }
                    _this.finishTutorial(tutInst);
                }
                catch (e) {
                    console.error(e);
                }
            });
        };
        var cancelEvent = registerFinishEvts();
        tutInst.registerFinishEvts = registerFinishEvts;
        tutInst.cancelFinishEvts = cancelEvent;
        this.sequenceQueue.push(tutInst);
        this.finalizeMap[ts.name] = function () {
            cancelEvent();
        };
    };
    /**
     * 注册事件教学
     * @param startEvts
     * @param finishEvts
     * @param ts
     * @returns
     */
    TutorialManager.prototype.addEventTutorial = function (startEvts, finishEvts, ts) {
        var _this = this;
        if (this.finalizeMap[ts.name] || this.eventMap[ts.name]) {
            console.error('不能添加重复的名字', ts);
            return;
        }
        console.log('addEventTut===', ts.name);
        var tutInst = {
            running: false,
            finished: false,
            index: ts.index || 0,
            loopNum: 0,
            ts: ts,
        };
        this.eventMap[ts.name] = tutInst;
        // 接收到开始教学事件调用方法
        var startFunc = function () {
            try {
                if (tutInst.running) {
                    return;
                }
                if (_this.canJump(tutInst.ts)) {
                    return;
                }
                if (ts.intervalStartTime &&
                    tutInst.lastCompleteTime &&
                    Date.now() - tutInst.lastCompleteTime < ts.intervalStartTime) {
                    return;
                }
                if (!_this.isPiro(tutInst))
                    return;
                if (!ts.canStart || ts.canStart()) {
                    console.log('教学管理器 start 事件教学====');
                    _this.startTutorial(tutInst);
                }
            }
            catch (e) {
                console.error(e);
            }
        };
        // 接收到结束教学事件调用方法
        var fninishFunc = function () {
            try {
                if (!tutInst.running || tutInst.finished) {
                    return;
                }
                if (ts.canFinish && !ts.canFinish()) {
                    return;
                }
                _this.finishTutorial(tutInst, FinishType.FinishEvts);
            }
            catch (e) {
                console.error(e);
            }
        };
        // 注册教学开始事件方法
        var _registerStartEvts = function () {
            return _this._registerEvent(startEvts, startFunc);
        };
        // 注册教学结束事件方法
        var _registerFinishEvts = function () {
            return _this._registerEvent(finishEvts, fninishFunc);
        };
        // 注册教学开始结束事件
        var cancelStartEvent = _registerStartEvts();
        var cancelFinishEvent = _registerFinishEvts();
        tutInst.cancelFinishEvts = cancelFinishEvent;
        tutInst.registerFinishEvts = _registerFinishEvts;
        // tutInst.cancelStartEvts = cancelStartEvent;
        // tutInst.registerStartEvts = _registerStartEvts;
        // 存储教学取消方法
        this.finalizeMap[ts.name] = function () {
            cancelStartEvent();
            cancelFinishEvent();
        };
        if (startEvts && startEvts.length === 0) {
            startFunc();
        }
    };
    /**
     * 注册事件方法
     * @param evts
     * @param cb
     * @returns 注销事件函数
     */
    TutorialManager.prototype._registerEvent = function (evts, cb) {
        var arr = [];
        evts.forEach(function (e) {
            if (e.type === TutorialEventType.MxEvent) {
                esm_1.default.event.on(e.param, cb);
                arr.push(function () {
                    esm_1.default.event.off(e.param, cb);
                });
            }
            else if (e.type === TutorialEventType.MxStore) {
                esm_1.default.store.on(e.param, cb, false);
                arr.push(function () {
                    esm_1.default.store.off(e.param, cb);
                });
            }
            else if (e.type === TutorialEventType.ModelShow) {
                var func = function (_a) {
                    var tpl = _a.tpl;
                    if (tpl === e.param) {
                        cb();
                    }
                };
                // mx.event.on(EventNames.openPop, func);
                // arr.push(() => {
                //   mx.event.off(EventNames.openPop, func);
                // });
            }
        });
        return function () {
            arr.forEach(function (a) {
                a();
            });
        };
    };
    /**
     *  将当前显示的教学入栈
     */
    TutorialManager.prototype.pushStatck = function () {
        var _a;
        var tutInst = this.currentTut;
        if (tutInst) {
            this.currentTut = null;
            if ((_a = tutInst.ts) === null || _a === void 0 ? void 0 : _a.needInStack) {
                if (tutInst.cancelFinishEvts) {
                    tutInst.cancelFinishEvts();
                    tutInst.cancelFinishEvts = null;
                }
                if (tutInst.ts.hide) {
                    tutInst.ts.hide();
                }
                this.tutStatck.push(tutInst);
            }
            else {
                this.finishTutorial(tutInst);
            }
        }
    };
    // 弹出要显示的教学
    TutorialManager.prototype.popStack = function () {
        if (this.tutStatck.length === 0) {
            return;
        }
        var tutInst = this.tutStatck.pop();
        if (!tutInst) {
            return;
        }
        this.currentTut = tutInst;
        if (tutInst.registerFinishEvts) {
            tutInst.cancelFinishEvts = tutInst.registerFinishEvts();
        }
        if (tutInst.ts.show) {
            tutInst.ts.show();
        }
    };
    TutorialManager.prototype.isPiro = function (tutInst) {
        var curTut = this.currentTut;
        if (curTut && curTut.running && curTut.index >= tutInst.index) {
            return false;
        }
        return true;
    };
    /**
     * 自动教学
     * @param tut
     */
    TutorialManager.prototype.startAutoTime = function (tutInst) {
        var _this = this;
        tutInst.loopNum++;
        var ts = tutInst.ts;
        tutInst.hiding = false;
        if (this.tutStatck.length <= 0) {
            if (ts.show) {
                ts.show();
            }
        }
        // 计时，到时间自动finish
        clearTimeout(tutInst.timeoutHandler);
        tutInst.timeoutHandler = setTimeout(function () {
            if (tutInst.loopNum >= ts.autoShowLoopNum) {
                _this.finishTutorial(tutInst);
            }
            else {
                // 隐藏interval时间后再次显示
                tutInst.hiding = true;
                if (ts.hide) {
                    ts.hide();
                }
                tutInst.timeoutHandler = setTimeout(function () {
                    _this.startAutoTime(tutInst);
                }, ts.autoIntervalTime || 3000);
            }
        }, ts.autoFinishTime);
    };
    /**
     * 开始教学
     * @param tutInst
     */
    TutorialManager.prototype.startTutorial = function (tutInst) {
        var tut = tutInst;
        this.pushStatck();
        tut.running = true;
        this.currentTut = tut;
        var ts = tut.ts;
        console.log('开始教学', ts.name);
        if (ts.autoFinishTime) {
            this.startAutoTime(tutInst);
        }
        else if (ts.show) {
            ts.show();
        }
        if (ts.onStart) {
            console.log("start:".concat(ts.name));
            ts.onStart();
        }
    };
    /**
     * 结束教学
     * @param tutInst TutInstance 教学实例
     */
    TutorialManager.prototype.finishTutorial = function (tutInst, finishType) {
        var _this = this;
        var tut = tutInst;
        var ts = tut.ts;
        this.save(ts.name);
        if (tutInst.timeoutHandler) {
            clearTimeout(tutInst.timeoutHandler);
        }
        if (ts.hide) {
            ts.hide();
        }
        if (ts.onFinish) {
            ts.onFinish();
        }
        if (finishType === FinishType.FinishEvts && ts.onEvtsFinish) {
            ts.onEvtsFinish();
        }
        if (ts.nextDelayTime) {
            if (this.nextWaitTimeHandler)
                clearTimeout(this.nextWaitTimeHandler);
            this.nextWaitTime = ts.nextDelayTime;
            this.nextWaitTimeHandler = setTimeout(function () {
                _this.nextWaitTime = 0;
                _this.update();
            }, ts.nextDelayTime);
        }
        if (ts.onlyOnce) {
            tut.finished = true;
            this.cancelTutorial(ts.name);
        }
        else {
            tut.running = false;
            tut.lastCompleteTime = Date.now();
            if (this.currentTut && this.currentTut.ts.name === ts.name) {
                this.currentTut = null;
            }
        }
        // requestAnimationFrame(() => {
        //   this.update();
        // });
        this.popStack();
    };
    /**
     * 取消教学
     * @param name string 教学名字
     */
    TutorialManager.prototype.cancelTutorial = function (name) {
        try {
            console.log('取消教学==>', name);
            this.tutStatck = this.tutStatck.filter(function (v) { return v.ts.name !== name; });
            this.sequenceQueue = this.sequenceQueue.filter(function (v) { return v.ts.name !== name; });
            if (this.currentTut && this.currentTut.ts.name === name) {
                this.currentTut = null;
            }
            delete this.eventMap[name];
            var func = this.finalizeMap[name];
            if (func) {
                delete this.finalizeMap[name];
                func();
            }
        }
        catch (e) {
            console.error(e);
        }
    };
    /**
     * 教学今日是否完成过
     * @param name
     * @returns
     */
    TutorialManager.prototype.todayHasFinished = function (name) {
        var _a;
        return isToday((_a = this.storageData[name]) === null || _a === void 0 ? void 0 : _a.date);
    };
    /**
     * 教学今日是否全部完成
     * @param ts
     * @returns
     */
    TutorialManager.prototype.todayTimesOut = function (ts) {
        var name = ts.name, timesOneDay = ts.timesOneDay;
        var curData = this.storageData[name];
        if (!timesOneDay || +timesOneDay <= 0)
            return true;
        if (isToday(curData === null || curData === void 0 ? void 0 : curData.date)) {
            return (curData === null || curData === void 0 ? void 0 : curData.count) && (curData === null || curData === void 0 ? void 0 : curData.count) >= timesOneDay;
        }
        else {
            return false;
        }
    };
    /**
     * 教学是否完成过
     * @param name
     * @returns
     */
    TutorialManager.prototype.hasFinished = function (name) {
        return !!this.storageData[name];
    };
    /**
     * 存储教学完成信息
     * @param name
     */
    TutorialManager.prototype.save = function (name) {
        try {
            var curData = this.storageData[name];
            this.storageData[name] = {
                date: getFormatDate(),
                count: isToday(curData === null || curData === void 0 ? void 0 : curData.date) ? (curData === null || curData === void 0 ? void 0 : curData.count) + 1 : 1,
            };
            (0, localStorage_1.setStorage)(this.storageName, JSON.stringify(this.storageData));
        }
        catch (e) {
            console.log(e);
        }
    };
    /**
     * 加载本地教学信息
     * @param storageName
     * @returns
     */
    TutorialManager.prototype.load = function (storageName) {
        this.storageName = storageName;
        try {
            // if (
            //   isLevel(1) && mx.store.get(StoreNames.bag) === 0
            // ) {
            //   this.storageData = {};
            //   return;
            // }
            var str = (0, localStorage_1.getStorage)(this.storageName);
            if (str) {
                this.storageData = JSON.parse(str);
                return;
            }
        }
        catch (e) {
            console.log(e);
        }
        this.storageData = {};
    };
    /**
     * 当前是否在教学
     */
    TutorialManager.prototype.isRunning = function () {
        var _a;
        return !!((_a = this.currentTut) === null || _a === void 0 ? void 0 : _a.running) || !!this.tutStatck.length;
    };
    /**
     * 当前教学
     */
    TutorialManager.prototype.getCurrentTut = function () {
        return this.currentTut;
    };
    /**
     * 结束当前教学
     */
    TutorialManager.prototype.finishCurrent = function () {
        if (this.currentTut && this.currentTut.running) {
            this.finishTutorial(this.currentTut);
        }
    };
    return TutorialManager;
}());
exports.TutorialManager = TutorialManager;
exports.default = new TutorialManager();
