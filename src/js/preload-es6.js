class Preload {
	constructor(opts) {
		//可修改参数
		this.isDebug = opts.isDebug || false;
		this.sources = opts.sources || null;
		this.progress = opts.progress || function(){};
		this.connector = opts.connector || null;
		this.completeLoad = opts.completeLoad || function(){};
		this.timeOut = opts.loadingOverTime || 15;
		this.timeOutCB = opts.loadingOverTimeCB || function(){};

		//业务逻辑所需参数
		this.params = {
			echetotal: 0,											//队列总数
			echelon: [],											//队列资源列表
			echelonlen: [],											//记录每个队列长度
			echeloncb: [],											//队列回调标示

			id: 0,													//自增ID
			flag: 0,												//标示梯队

			allowType: ['jpg', 'jpeg', 'png', 'gif'],				//允许加载的图片类型
			total: 0,												//资源总数
			completedCount: 0,										//已加载资源总数

			_createXHR: null,										//Ajax初始化

			//img标签预加载
			imgNode: [],
			imgNodePSrc: [],

			//audio标签预加载
			audioNode: [],
			audioNodePSrc: [],

			//异步调用接口数据
	        head: document.getElementsByTagName("head")[0],
		}

		if(this.sources == null){
			this.throwIf('必须传入sources参数');
			return;
		}

		this._init();
	}

	_init() {
		let self = this,
			params = self.params;
		// console.log("sources", this.sources);
		// console.log("progress", this.progress);
		// console.log("connector", this.connector);
		// console.log("completeLoad", this.completeLoad);
		// console.log("timeOut", this.timeOut);
		// console.log("timeOutCB", this.timeOutCB);
		// console.log("params", this.params);

		//初始化资源参数
		self._initData();

		//开始预加载资源
		self._load(params.echelon[0]);
	}

	_load(flagRes, flag = 0) {
		let self = this,
			params = self.params;


		console.log(flagRes);

		/*
		*	返回队列内资源加载promise数组，异步
		*
		*/
		let promise = flagRes.map((res) => {
			self.progress(++params.id, params.total);
			if(self.isImg(res)) {
				return self.preloadImage(res);
				
			}else{
				return self.preloadAudio(res);
			}
		});

		/*
		*	执行队列内资源加载promise数组，分成功和失败
		*
		*/
		Promise.all(promise).then((success) => {
			// console.log("图片加载成功");
			if(params.flag < params.echetotal - 1) {
				params.echeloncb[params.flag]();
				self._load(params.echelon[++params.flag]);
			}else {
				params.echeloncb[params.flag]();
				self.completeLoad();
			}
		}).catch((error) => {
			let msg = error.path ? "资源加载失败，检查资源路径：" + error.path[0].src : error;
			self.throwIf(msg);
		})

	}

	/*
	*	初始化预加载所需数据
	*	echetotal									队列总数
	*	echelon										队列资源数组
	*	total										资源总数
	*	echelonlen									队列回调标记数组
	*	echeloncb									队列回调函数数组
	*/
	_initData() {
		let self = this,
			params = self.params,
			k = 0;
		params.echetotal = Object.getOwnPropertyNames(self.sources).length;
	
		//处理梯队资源和回调
		for(let i in self.sources){
			params.echelon[k] = []
			for(let j = 0, len = self.sources[i].source.length; j < len; j++){
				++params.total;
				params.echelon[k].push(self.sources[i].source[j]);
			}
			//对于资源队列echelon进行去重
			params.echelon[k] = [...new Set(params.echelon[k])];

			// console.log(params.echelon[k]);

			params.echelonlen.push(params.echelon[k].length);


			params.echeloncb.push(typeof self.sources[i].callback == 'undefined' ? function(){} : self.sources[i].callback);

			k++;
		}


		//Ajax初始化
		// params._createXHR = self.getXHR();

		//梯队回调标示位置
		for(let i = 1, len = params.echelonlen.length; i < len; i++){
			params.echelonlen[i] = params.echelonlen[i - 1] + params.echelonlen[i];
		}

		//处理img标签的预加载
		params.imgNode = document.getElementsByTagName('img');			//获取img标签节点
		for(let i = 0, len = params.imgNode.length; i < len; i++){
			if(params.imgNode[i].attributes.pSrc){
				params.imgNodePSrc[i] = params.imgNode[i].attributes.pSrc.value;
			}
		}

		//处理audio标签的预加载
		params.audioNode = document.getElementsByTagName('audio');			//获取img标签节点
		for(let i = 0, len = params.audioNode.length; i < len; i++){
			if(params.audioNode[i].attributes.pSrc){
				params.audioNodePSrc[i] = params.audioNode[i].attributes.pSrc.value;
			}
		}

		// console.log("sources", self.sources);
		// console.log("params.echetotal", params.echetotal);
		// console.log("params.echelon", params.echelon);
		// console.log("params.echelonlen", params.echelonlen);
		// console.log("params.echeloncb", params.echeloncb);
		// console.log("params._createXHR", params._createXHR);
		// console.log("params.total", params.total);
		// console.log("params.imgNode", params.imgNode);
		// console.log("params.imgNodePSrc", params.imgNodePSrc);
		// console.log("params.audioNode", params.audioNode);
		// console.log("params.audioNodePSrc", params.audioNodePSrc);
		// console.log("params.flag", params.flag);
		// console.log("self.completeLoad", self.completeLoad);
		// console.log("self.progress", self.progress);
		// console.log("params.id", params.id);
	}


	//返回加载图片资源premise对象
	preloadImage(url) {
		return new Promise(function(resolve, reject) {
			let image = new Image();
			image.onload = resolve;
			image.onerror = reject;
			image.src = url;
		});
	}

	//返回加载音频资源premise对象
	preloadAudio(url) {
		let self = this,
			params = self.params;

		// console.log("params", params);

		return new Promise((resolve, reject) => {
			params._createXHR = new XMLHttpRequest();
			params._createXHR.open("GET", url);
			params._createXHR.onreadystatechange = handler;
			params._createXHR.send();

            function handler() {
                if (this.readyState !== 4) {
                    return;
                }
                if (this.status === 200) {
                    resolve(this.response);
                } else {
                    reject(new Error(this.statusText));
                }
            }

		});
	}

	//错误数据弹出
	throwIf(msg = '未知错误') {
		if(this.isDebug){
			alert(msg);
			return;
		}
	}

	//判断是否是图片
	isImg(res) {
		var self = this,
			params = self.params,
		 	type = res.split('.').pop();

		for (var i = 0, len = params.allowType.length; i < len; i++) {
			if (type == params.allowType[i]) return true;
		}
		return false;
	}

	//获取XHR，已废弃
	getXHR() {
		if (typeof XMLHttpRequest != "undefined") {
			return new XMLHttpRequest();
		} else if (typeof ActiveXObject != "undefined") {
			if (typeof arguments.callee.activeXString != "string") {
				var versions = ["MSXML2.XMLHttp.6.0", "MSXML2.XMLHttp.3.0",
						"MSXML2.XMLHttp"
					],
					i, len;
				for (let i = 0, len = versions.length; i < len; i++) {
					try {
						new ActiveXObject(versions[i]);
						arguments.callee.activeXString = versions[i];
						break;
					} catch (ex) {
						//跳过
					}
				}
			}
			return new ActiveXObject(arguments.callee.activeXString);
		} else {
			throw new Error("No XHR object available.");
		}
	}
}