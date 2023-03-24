export interface TutSetting {
    name: string;
    nextDelayTime?: number;
    autoFinishTime?: number;
    autoIntervalTime?: number;
    autoShowLoopNum?: number;
    onceOneDay?: boolean;
    onlyOnce?: boolean;
    timesOneDay?: number;
    needInStack?: boolean;
    intervalStartTime?: number;
    index?: number;
    /**
     * 在可以触发时判断教学是否能开始或结束
     */
    canStart?: () => boolean;
    canFinish?: () => boolean;
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
    ts: TutSetting;
    running: boolean;
    finished: boolean;
    hiding?: boolean;
    index: number;
    lastCompleteTime?: number;
    registerFinishEvts?: Function;
    loopNum: number;
    timeoutHandler?: any;
    cancelFinishEvts?: Function;
}
export declare enum TutorialEventType {
    MxEvent = 0,
    MxStore = 1,
    ModelShow = 2
}
export declare enum FinishType {
    FinishEvts = 0
}
export interface TutorialEventInfo {
    type: TutorialEventType;
    /**
     * MxEvent和MxStore的param对应name
     * ModelShow和ModelHide的param对应tpl
     */
    param: string;
}
export declare class TutorialManager {
    private storageName;
    private interval;
    private handler;
    private storageData;
    /** 顺序教学队列 */
    private sequenceQueue;
    /** 事件教学map */
    private eventMap;
    /** 事件教学取消map */
    private finalizeMap;
    /** 当前教学实例 */
    private currentTut;
    /** 被隐藏教学队列 */
    private tutStatck;
    /** 下一个顺序教学等待时间 */
    private nextWaitTime;
    private nextWaitTimeHandler;
    private _waitLoadPromise;
    private _resolve;
    constructor();
    waitLoad(): Promise<void>;
    /**
     * 初始化教学，开启顺序教学
     * @param interval number 循序教学查询间隔时间
     * @param storageName string 存储教学信息storageName
     */
    init(interval?: number, storageName?: string): Promise<void>;
    setUserId(id: string): void;
    /**
     * 更新顺序教学
     * @returns
     */
    update: () => void;
    /**
     * 教学是否可以跳过
     * @param ts
     * @returns
     */
    private canJump;
    /**
     * 获取下一个顺序教学实例
     * @returns
     */
    private getNextSeqTutorial;
    /**
     * 加载顺序教学
     * @param finishEvts
     * @param ts
     * @returns
     */
    addSequenceTutorial(finishEvts: TutorialEventInfo[], ts: TutSetting): void;
    /**
     * 注册事件教学
     * @param startEvts
     * @param finishEvts
     * @param ts
     * @returns
     */
    addEventTutorial(startEvts: TutorialEventInfo[], finishEvts: TutorialEventInfo[], ts: TutSetting): void;
    /**
     * 注册事件方法
     * @param evts
     * @param cb
     * @returns 注销事件函数
     */
    private _registerEvent;
    /**
     *  将当前显示的教学入栈
     */
    pushStatck(): void;
    popStack(): void;
    private isPiro;
    /**
     * 自动教学
     * @param tut
     */
    private startAutoTime;
    /**
     * 开始教学
     * @param tutInst
     */
    private startTutorial;
    /**
     * 结束教学
     * @param tutInst TutInstance 教学实例
     */
    private finishTutorial;
    /**
     * 取消教学
     * @param name string 教学名字
     */
    private cancelTutorial;
    /**
     * 教学今日是否完成过
     * @param name
     * @returns
     */
    todayHasFinished(name: string): boolean;
    /**
     * 教学今日是否全部完成
     * @param ts
     * @returns
     */
    todayTimesOut(ts: TutSetting): boolean;
    /**
     * 教学是否完成过
     * @param name
     * @returns
     */
    hasFinished(name: string): boolean;
    /**
     * 存储教学完成信息
     * @param name
     */
    save(name: string): void;
    /**
     * 加载本地教学信息
     * @param storageName
     * @returns
     */
    load(storageName: string): void;
    /**
     * 当前是否在教学
     */
    isRunning(): boolean;
    /**
     * 当前教学
     */
    getCurrentTut(): TutInstance;
    /**
     * 结束当前教学
     */
    finishCurrent(): void;
}
declare const _default: TutorialManager;
export default _default;
