> 一个stompjs的简单应用

[![NPM](https://nodei.co/npm/wrapper-stompjs.png)](https://nodei.co/npm/wrapper-stompjs/)
## 导入包

1. npm install --save sockjs-client@1.0.0
2. npm install --save stompjs@2.3.3
3. npm install --save wrapper-stompjs

## 在线demo

在线演示：[click here](https://chuxiaoguo.github.io/wrapper-stompjs/.)

github: [https://github.com/chuxiaoguo/wrapper-stompjs](https://github.com/chuxiaoguo/wrapper-stompjs)

## 介绍

### sockjs-client

sockjs-client是从SockJS中分离出来的用于客户端使用的通信模块.所以我们就直接来看看SockJS.SockJS是一个浏览器的JavaScript库,它提供了一个类似于网络的对象,SockJS提供了一个连贯的,跨浏览器的JavaScriptAPI,它在浏览器和Web服务器之间创建了一个低延迟,全双工,跨域通信通道.你可能会问,我为什么不直接用原生的WebSocket而要使用SockJS呢?这得益于SockJS的一大特性,一些浏览器中缺少对WebSocket的支持,因此，回退选项是必要的，而Spring框架提供了基于SockJS协议的透明的回退选项。SockJS提供了浏览器兼容性,优先使用原生的WebSocket,如果某个浏览器不支持WebSocket,SockJS会自动降级为轮询.

### stomjs

STOMP(Simple Text-Orientated Messaging Protocol) 面向消息的简单文本协议;  
WebSocket是一个消息架构,不强制使用任何特定的消息协议,它依赖于应用层解释消息的含义.  
与HTTP不同,WebSocket是处在TCP上非常薄的一层,会将字节流转化为文本/二进制消息,因此,对于实际应用来说,WebSocket的通信形式层级过低,因此，可以在 WebSocket 之上使用STOMP协议，来为浏览器 和 server间的 通信增加适当的消息语义。

## 使用

1\. 导入文件websock.js  
2\. 通过构造函数新建一个websocket实例（可以通过传入参数修改实例属性），同时传入接收消息的回调  
3\. 调用init方法启动ws的推送

4\. 调用destroyed销毁实例，并停止推送

```
import {WebSocketFactory} from 'wrapper-stompjs';

const config = {

debug: true,

socketId: '408755***@qq.com',

socketTicket: Cookie.getToken(),

socketUrl: '//113.88.13.224:9205/bas-ws-endpoint',

subscribeTag: '/user-ws/' + this.socketId + '/ws/noticeCenter',

sendMsgTag: '/bas-ws-receive/ws/noticeCenterHeartBeat'

}

// 创建ws实例

const ws = new WebSocketFactory(

config,

(message) => {

  // 接收到推送的消息

},

(success) => {

// 成功连接回调

console.log(success);

},

(err) => {

// 连接失败的回调

console.log(err);

}

);

// 开启ws推送

ws.init();

// 关闭ws推送

ws.stopConnect();

// 销毁实例

ws.destroyed();
```

如果你想做失败重连机制，可以通过监听失败的回调，重新调用init方法，直到执行成功的回调

## api


### public

| 属性 | 说明 |
| --- | --- |
| socketId | socketId的标识，一般是用户的账号（邮件，手机号），如果都不是，则是一个时间戳   |
| socketTicket | socket的Ticket，即用户的ticket，一般从cookie中取   |
| heartBeatTime | 心跳发送的间隔时间，默认是1分钟 |
| debug | 是否开启debug模式，默认是开启   |
| socketUrl | socket的订阅地址 |
| subscribeTag | socket的订阅地址后缀标签 |
| sendMsgTag | 订阅发送心跳的地址 |

```
interface WebSocketParams {

socketId?: string,  
socketUrl?: string,  
socketTicket?: string,  
subscribeTag?: string,  
sendMsgTag?: string,  
heartBeatTime?: number,  
debug?: boolean;

}

type newWsType = new (

config?： WebSocketParams,

(message) => {

  // 接收到推送的消息

},

(success) => {

// 成功连接回调

console.log(success);

},

(err) => {

    // 连接失败的回调

    console.log(err);

)
}
```


| 方法 | 说明 |
| --- | --- |
| new () |  初始化ws实例，参数一是配置（如果没有，填null），参数二注册推送消息的回调（选填），参数三连接成功的回调（选填），参数四是连接失败的回调（选填） |
| init() | 开启ws推送  |
| stopConnect() | 断开websocket推送 |
| destroyed() | 销毁websocket实例 |

### private

  

| 方法 | 说明 |
| --- | --- |
| receiveMQCb | 接收消息的回调 |
| connectSucCb | 接收消息的回调 |
| connectErrCb | 接收消息的回调 |
| stompClient | stomp对象 |
| subscription | stomp订阅对象的引用 |
| timer | 轮训器的引用 |
| initWebSocketProp() | 初始化配置项 |
| createdSocketId() | 如果没有指定的socketId，会从localStorage，建议传入socketId |
| onConnect() | ws连接成功的回调 |
| pollSendHeartBeat() | 发送心跳 |
| onError() | 推送异常 |

## 注意

* ERROR in ./node_modules/stompjs/lib/stomp-node.js Module not found: 
Error: Can't resolve 'net' in 'D:\sky\iot-web\node_modules\stompjs\lib'

解决办法 npm i net -S

* sockjs-client

必须指定版本为1.0.0

