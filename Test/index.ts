
//！！！ 最好结合事件管理器使用 
// npm i @pzhiq/esm 

import GuideManager, { GuideEventType } from '../dist/index'
import esm from "@pzhiq/esm"

// 初始化教学管理器
async function initGuide() {
    try {
        GuideManager.setUserId('设置用户id 每一个用户教学相互独立')
        await GuideManager.init();
    } catch (error) {
        console.log('init tutorial error', error);
    }
}
initGuide();
//顺序教学示例
// GuideManager.addSequenceTutorial([教学结束的事件], 教学配置)
GuideManager.addSequenceTutorial([{
    type: GuideEventType.MxEvent,
    param: "click",
}], {
    name: 'firstGuide',
    onlyOnce: true,
    nextDelayTime: 500,
    //每隔一定时间去轮询是否可以开始
    canStart: () => {
        //开始教学条件 布尔值 比如 level>5
        return true
    },
    // canJumpOver() {
    //     return true
    // },
    onStart() {
        console.log("Onstart doing something");
    },
    onFinish() {
        console.log("Guide Finish doing");
    }
})
// 事件教学示例
// GuideManager.addEventTutorial([教学开始的事件],[教学结束的事件] 教学配置)
GuideManager.addEventTutorial([{
    type: GuideEventType.MxEvent,
    param: "eventGuide",
}], [{
    type: GuideEventType.MxEvent,
    param: "GuideClose",
}], {
    name: 'eventGuide',
    onlyOnce: true,
    nextDelayTime: 500,
    canStart: () => {
        return true;
    },
    // canJumpOver() {
    //     return true
    // },
    onStart() {
        console.log("事件教学开始");
    },
    onFinish() {
        console.log("事件教学结束");
    }
})
//顺序教学结束的事件
setTimeout(() => {
    esm.event.emit("click");
}, 2000);
// test事件教学开始的触发
setTimeout(() => {
    esm.event.emit("eventGuide");
    setTimeout(() => {
        //事件教学结束的触发
        esm.event.emit("GuideClose");
    }, 2000);
}, 3000);
