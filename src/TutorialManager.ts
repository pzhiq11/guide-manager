import mx from '@pzhiq/esm';
import { getStorage, getUserId, setStorage, _setUserId } from './localStorage';

export interface TutSetting {
  name: string;
  // 顺序教学下个教学延迟出现时间
  nextDelayTime?: number;
  // 教学自动关闭时间
  autoFinishTime?: number;
  // 展示教学结束后多久出下一个教学的时间
  autoIntervalTime?: number;
  // 自动展示的次数，次数不消耗完不能进下一个教学
  autoShowLoopNum?: number;
  // 一天只出一次
  onceOneDay?: boolean;
  // 只一次
  onlyOnce?: boolean;
  // 每天出多少次
  timesOneDay?: number;
  // 是否入栈，false-显示时被覆盖就结束， true-显示时被覆盖，在当前教学结束后会恢复显示
  needInStack?: boolean;
  // 完成一次后第二次出现间隔时间
  intervalStartTime?: number;
  // 教学优先级
  index?: number;

  /**
   * 在可以触发时判断教学是否能开始或结束
   */
  canStart?: () => boolean;
  canFinish?: () => boolean;
  // 是否满足跳过条件
  canJumpOver?: () => boolean;
  /**
   * 因为教学可能因为某些条件隐藏或显示，所以用show和hide控制教学显示和隐藏
   */
  show?: () => void;
  hide?: () => void;
  /**
   * 教学开始和结束时执行的逻辑
   */
  onStart?: () => void;
  onFinish?: () => void;
  onEvtsFinish?: () => void;
}

interface TutInstance {
  ts: TutSetting; // 教学设置
  running: boolean; // 是否正在教学
  finished: boolean; // 是否结束
  hiding?: boolean;
  index: number; // 优先级
  lastCompleteTime?: number; // 上次完成教学时间
  registerFinishEvts?: Function; // 注册教学结束方法
  loopNum: number; // 循环显示次数
  timeoutHandler?: any; // 循环显示次数定时器
  cancelFinishEvts?: Function; // 取消事件
  // registerStartEvts?: Function; // 注册教学开始事件方法
  // cancelStartEvts?: Function; // 取消教学开始事件
}

export enum TutorialEventType {
  MxEvent,
  MxStore,
  ModelShow,
  // ModelHide,
}

export enum FinishType {
  FinishEvts,
}
export interface TutorialEventInfo {
  type: TutorialEventType;
  /**
   * MxEvent和MxStore的param对应name
   * ModelShow和ModelHide的param对应tpl
   */
  param: string;
}

function getFormatDate() {
  const date = new Date();
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}
function isToday(s: string) {
  return s === getFormatDate();
}


export class TutorialManager {
  private storageName: string;
  private interval: number;
  private handler: any;
  private storageData: { [name: string]: any } = {};

  /** 顺序教学队列 */
  private sequenceQueue: TutInstance[] = [];
  /** 事件教学map */
  private eventMap: { [key: string]: TutInstance } = {};
  /** 事件教学取消map */
  private finalizeMap: { [key: string]: () => void } = {};

  /** 当前教学实例 */
  private currentTut: TutInstance;
  /** 被隐藏教学队列 */
  private tutStatck: TutInstance[] = [];
  /** 下一个顺序教学等待时间 */
  private nextWaitTime: number;

  private nextWaitTimeHandler: any;

  private _waitLoadPromise: Promise<void>;
  private _resolve: any;
  constructor() {
    this._waitLoadPromise = new Promise(resolve => {
      this._resolve = resolve;
    });
  }

  async waitLoad() {
    return this._waitLoadPromise;
  }

  /**
   * 初始化教学，开启顺序教学
   * @param interval number 循序教学查询间隔时间
   * @param storageName string 存储教学信息storageName
   */
  async init(interval = 1000, storageName = '__tutorial__1111') {
    try {
      await getUserId()
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
      //   visibility.watch(status => {
      //     clearInterval(this.handler);
      //     if (status === 'visible') {
      //       this.handler = setInterval(this.update, this.interval);
      //     }
      //   });
    } catch (error) {
      console.log(error);
    }
    this._resolve();
  }
  setUserId(id: string) {
    _setUserId(id);
  }
  /**
   * 更新顺序教学
   * @returns
   */
  update = () => {
    // this.judgeCurTutCanContinue();÷
    if (this.nextWaitTime > 0) {
      return;
    }
    if (this.sequenceQueue.length === 0) return;
    // 当前有教学时不更新顺序教学
    // if (this.currentTut && this.currentTut.running) {
    //   return;
    // }
    // 当前被压入栈中有教学时不更新顺序教学
    if (this.tutStatck.length > 0) return;
    const tutInst = this.getNextSeqTutorial();
    if (!tutInst || tutInst.running) return;
    // 顺序教学是否会被高优先级事件教学顶掉
    if (!this.isPiro(tutInst)) return;
    // if (mx.store.get(StoreName.Is_layer_on_show) || mx.store.get(StoreName.Is_modal_on_show)) return;
    // @ts-ignore
    // if (window?.__POP_MANAGER__?.queue?.current) return;

    const { ts } = tutInst;
    if (!ts.canStart || ts.canStart()) {
      console.log('教学管理器 start 教学====');
      this.startTutorial(tutInst);
    }
  };

  /**
   * 教学是否可以跳过
   * @param ts
   * @returns
   */
  private canJump(ts: TutSetting) {
    if (ts.onlyOnce && this.hasFinished(ts.name)) {
      return true;
    }
    if (ts.onceOneDay && isToday(this.storageData[ts.name]?.date)) {
      return true;
    }
    if (ts.timesOneDay && this.todayTimesOut(ts)) {
      return true;
    }
    if (ts.canJumpOver) {
      return ts.canJumpOver();
      // 自动跳过不能开始的教学，若不想跳过，需要实现canJumpOver方法
    } else if (ts.canStart && !ts.canStart() && (!ts.canFinish || ts.canFinish())) {
      return true;
    }
    return false;
  }

  /**
   * 获取下一个顺序教学实例
   * @returns
   */
  private getNextSeqTutorial(): TutInstance {
    if (this.sequenceQueue.length === 0) return;
    const tutInst = this.sequenceQueue[0];
    if (!tutInst) {
      this.sequenceQueue.unshift();
      return this.getNextSeqTutorial();
    }
    if (tutInst.running) {
      return tutInst;
    }
    const { ts } = tutInst;
    if (this.canJump(ts)) {
      this.cancelTutorial(ts.name);
      return this.getNextSeqTutorial();
    }
    return tutInst;
  }

  /**
   * 加载顺序教学
   * @param finishEvts
   * @param ts
   * @returns
   */
  addSequenceTutorial(finishEvts: TutorialEventInfo[], ts: TutSetting) {
    if (this.finalizeMap[ts.name] || this.eventMap[ts.name]) {
      console.error('不能添加重复的名字', ts);
      return;
    }
    console.log('addSequenceTutorial===', ts.name);
    const tutInst: TutInstance = {
      running: false,
      finished: false,
      index: ts.index || 10,
      loopNum: 0,
      ts,
    };

    const registerFinishEvts = () => {
      return this._registerEvent(finishEvts, () => {
        try {
          if (!tutInst.running || tutInst.finished) {
            return;
          }
          if (ts.canFinish && !ts.canFinish()) {
            return;
          }
          this.finishTutorial(tutInst);
        } catch (e) {
          console.error(e);
        }
      });
    };

    const cancelEvent = registerFinishEvts();
    tutInst.registerFinishEvts = registerFinishEvts;
    tutInst.cancelFinishEvts = cancelEvent;
    this.sequenceQueue.push(tutInst);

    this.finalizeMap[ts.name] = () => {
      cancelEvent();
    };
  }

  /**
   * 注册事件教学
   * @param startEvts
   * @param finishEvts
   * @param ts
   * @returns
   */
  addEventTutorial(startEvts: TutorialEventInfo[], finishEvts: TutorialEventInfo[], ts: TutSetting) {
    if (this.finalizeMap[ts.name] || this.eventMap[ts.name]) {
      console.error('不能添加重复的名字', ts);
      return;
    }
    console.log('addEventTut===', ts.name);
    const tutInst: TutInstance = {
      running: false,
      finished: false,
      index: ts.index || 0,
      loopNum: 0,
      ts,
    };
    this.eventMap[ts.name] = tutInst;
    // 接收到开始教学事件调用方法
    const startFunc = () => {
      try {
        if (tutInst.running) {
          return;
        }
        if (this.canJump(tutInst.ts)) {
          return;
        }
        if (
          ts.intervalStartTime &&
          tutInst.lastCompleteTime &&
          Date.now() - tutInst.lastCompleteTime < ts.intervalStartTime
        ) {
          return;
        }
        if (!this.isPiro(tutInst)) return;
        if (!ts.canStart || ts.canStart()) {
          console.log('教学管理器 start 事件教学====');
          this.startTutorial(tutInst);
        }
      } catch (e) {
        console.error(e);
      }
    };

    // 接收到结束教学事件调用方法
    const fninishFunc = () => {
      try {
        if (!tutInst.running || tutInst.finished) {
          return;
        }
        if (ts.canFinish && !ts.canFinish()) {
          return;
        }
        this.finishTutorial(tutInst, FinishType.FinishEvts);
      } catch (e) {
        console.error(e);
      }
    };
    // 注册教学开始事件方法
    const _registerStartEvts = () => {
      return this._registerEvent(startEvts, startFunc);
    };

    // 注册教学结束事件方法
    const _registerFinishEvts = () => {
      return this._registerEvent(finishEvts, fninishFunc);
    };

    // 注册教学开始结束事件
    const cancelStartEvent = _registerStartEvts();
    const cancelFinishEvent = _registerFinishEvts();

    tutInst.cancelFinishEvts = cancelFinishEvent;
    tutInst.registerFinishEvts = _registerFinishEvts;
    // tutInst.cancelStartEvts = cancelStartEvent;
    // tutInst.registerStartEvts = _registerStartEvts;
    // 存储教学取消方法
    this.finalizeMap[ts.name] = () => {
      cancelStartEvent();
      cancelFinishEvent();
    };

    if (startEvts && startEvts.length === 0) {
      startFunc();
    }
  }

  /**
   * 注册事件方法
   * @param evts
   * @param cb
   * @returns 注销事件函数
   */
  private _registerEvent(evts: TutorialEventInfo[], cb: () => void) {
    const arr: Array<() => void> = [];
    evts.forEach(e => {
      if (e.type === TutorialEventType.MxEvent) {
        mx.event.on(e.param, cb);
        arr.push(() => {
          mx.event.off(e.param, cb);
        });
      } else if (e.type === TutorialEventType.MxStore) {
        mx.store.on(e.param, cb, false);
        arr.push(() => {
          mx.store.off(e.param, cb);
        });
      } else if (e.type === TutorialEventType.ModelShow) {
        const func = ({ tpl }) => {
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
    return () => {
      arr.forEach(a => {
        a();
      });
    };
  }

  /**
   *  将当前显示的教学入栈
   */
  pushStatck() {
    const tutInst = this.currentTut;
    if (tutInst) {
      this.currentTut = null;
      if (tutInst.ts?.needInStack) {
        if (tutInst.cancelFinishEvts) {
          tutInst.cancelFinishEvts();
          tutInst.cancelFinishEvts = null;
        }
        if (tutInst.ts.hide) {
          tutInst.ts.hide();
        }
        this.tutStatck.push(tutInst);
      } else {
        this.finishTutorial(tutInst);
      }
    }
  }

  // 弹出要显示的教学
  popStack() {
    if (this.tutStatck.length === 0) {
      return;
    }
    const tutInst = this.tutStatck.pop();
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
  }

  private isPiro(tutInst: TutInstance) {
    const curTut = this.currentTut;
    if (curTut && curTut.running && curTut.index >= tutInst.index) {
      return false;
    }
    return true;
  }

  /**
   * 自动教学
   * @param tut
   */
  private startAutoTime(tutInst: TutInstance) {
    tutInst.loopNum++;
    const { ts } = tutInst;

    tutInst.hiding = false;
    if (this.tutStatck.length <= 0) {
      if (ts.show) {
        ts.show();
      }
    }
    // 计时，到时间自动finish
    clearTimeout(tutInst.timeoutHandler);
    tutInst.timeoutHandler = setTimeout(() => {
      if (tutInst.loopNum >= ts.autoShowLoopNum) {
        this.finishTutorial(tutInst);
      } else {
        // 隐藏interval时间后再次显示
        tutInst.hiding = true;
        if (ts.hide) {
          ts.hide();
        }
        tutInst.timeoutHandler = setTimeout(() => {
          this.startAutoTime(tutInst);
        }, ts.autoIntervalTime || 3000);
      }
    }, ts.autoFinishTime);
  }

  /**
   * 开始教学
   * @param tutInst
   */
  private startTutorial(tutInst: TutInstance) {
    const tut = tutInst;
    this.pushStatck();
    tut.running = true;
    this.currentTut = tut;
    const { ts } = tut;
    console.log('开始教学', ts.name);
    if (ts.autoFinishTime) {
      this.startAutoTime(tutInst);
    } else if (ts.show) {
      ts.show();
    }

    if (ts.onStart) {
      console.log(`start:${ts.name}`);
      ts.onStart();
    }
  }

  /**
   * 结束教学
   * @param tutInst TutInstance 教学实例
   */
  private finishTutorial(tutInst: TutInstance, finishType?: FinishType) {
    const tut = tutInst;
    const { ts } = tut;
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
      if (this.nextWaitTimeHandler) clearTimeout(this.nextWaitTimeHandler);
      this.nextWaitTime = ts.nextDelayTime;
      this.nextWaitTimeHandler = setTimeout(() => {
        this.nextWaitTime = 0;
        this.update();
      }, ts.nextDelayTime);
    }

    if (ts.onlyOnce) {
      tut.finished = true;
      this.cancelTutorial(ts.name);
    } else {
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
  }

  /**
   * 取消教学
   * @param name string 教学名字
   */
  private cancelTutorial(name: string) {
    try {
      console.log('取消教学==>', name);
      this.tutStatck = this.tutStatck.filter(v => v.ts.name !== name);
      this.sequenceQueue = this.sequenceQueue.filter(v => v.ts.name !== name);
      if (this.currentTut && this.currentTut.ts.name === name) {
        this.currentTut = null;
      }
      delete this.eventMap[name];
      const func = this.finalizeMap[name];
      if (func) {
        delete this.finalizeMap[name];
        func();
      }
    } catch (e) {
      console.error(e);
    }
  }

  /**
   * 教学今日是否完成过
   * @param name
   * @returns
   */
  todayHasFinished(name: string) {
    return isToday(this.storageData[name]?.date);
  }

  /**
   * 教学今日是否全部完成
   * @param ts
   * @returns
   */
  todayTimesOut(ts: TutSetting) {
    const { name, timesOneDay } = ts;
    const curData = this.storageData[name];
    if (!timesOneDay || +timesOneDay <= 0) return true;
    if (isToday(curData?.date)) {
      return curData?.count && curData?.count >= timesOneDay;
    } else {
      return false;
    }
  }

  /**
   * 教学是否完成过
   * @param name
   * @returns
   */
  hasFinished(name: string) {
    return !!this.storageData[name];
  }

  /**
   * 存储教学完成信息
   * @param name
   */
  save(name: string) {
    try {
      const curData = this.storageData[name];
      this.storageData[name] = {
        date: getFormatDate(),
        count: isToday(curData?.date) ? curData?.count + 1 : 1,
      };
      setStorage(this.storageName, JSON.stringify(this.storageData));
    } catch (e) {
      console.log(e);
    }
  }

  /**
   * 加载本地教学信息
   * @param storageName
   * @returns
   */
  load(storageName: string) {
    this.storageName = storageName;
    try {
      // if (
      //   isLevel(1) && mx.store.get(StoreNames.bag) === 0
      // ) {
      //   this.storageData = {};
      //   return;
      // }
      const str = getStorage(this.storageName);
      if (str) {
        this.storageData = JSON.parse(str);
        return;
      }
    } catch (e) {
      console.log(e);
    }
    this.storageData = {};
  }

  /**
   * 当前是否在教学
   */
  isRunning() {
    return !!this.currentTut?.running || !!this.tutStatck.length;
  }

  /**
   * 当前教学
   */
  getCurrentTut() {
    return this.currentTut;
  }

  /**
   * 结束当前教学
   */
  finishCurrent() {
    if (this.currentTut && this.currentTut.running) {
      this.finishTutorial(this.currentTut);
    }
  }
}

export default new TutorialManager();
