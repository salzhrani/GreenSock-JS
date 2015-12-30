/*!
 * VERSION: 1.15.3
 * DATE: 2015-12-22
 * UPDATES AND DOCS AT: http://greensock.com
 *
 * @license Copyright (c) 2008-2016, GreenSock. All rights reserved.
 * This work is subject to the terms at http://greensock.com/standard-license or for
 * Club GreenSock members, the software agreement that was issued with your membership.
 * 
 * @author: Jack Doyle, jack@greensock.com
 **/
import { Ease } from '../TweenLite';

const _2PI = Math.PI * 2;
const _HALF_PI = Math.PI / 2;


// var _gsScope = (typeof(module) !== "undefined" && module.exports && typeof(global) !== "undefined") ? global : this || window; //helps ensure compatibility with AMD/RequireJS and CommonJS/Node
// (_gsScope._gsQueue || (_gsScope._gsQueue = [])).push( function() {


// const noop = () => {};
const createEaseClass = (fn) => {
	return class extends Ease {
		constructor() {
			this.getRatio = fn;
		}
	};
};

const wrapEase = (name, EaseOut, EaseIn, EaseInOut, aliases) => {
	const c = createEaseClass({
		easeOut: new EaseOut(),
		easeIn: new EaseIn(),
		easeInOut: new EaseInOut(),
	});
	Ease.register(name, c);
	return c;
}

const EasePoint = (time, value, next) => {
	this.t = time;
	this.v = value;
	if (next) {
		this.next = next;
		next.prev = this;
		this.c = next.v - value;
		this.gap = next.t - time;
	}
};

//Back
const _createBack = function(n, fn) {
	return class C extends Ease {
		constructor(overshoot) {
			this._p1 = (overshoot || overshoot === 0) ? overshoot : 1.70158;
			this._p2 = this._p1 * 1.525;
			this.getRatio = fn;
		}
		config(overshoot) {
			return new C(overshoot);
		}
	};
};

export const Back = wrapEase('Back',
	_createBack('BackOut', (p) => {
		return ((p = p - 1) * p * ((this._p1 + 1) * p + this._p1) + 1);
	}),
	_createBack('BackIn', (p) => {
		return p * p * ((this._p1 + 1) * p - this._p1);
	}),
	_createBack('BackInOut', (p) => {
		return ((p *= 2) < 1) ? 0.5 * p * p * ((this._p2 + 1) * p - this._p2) : 0.5 * ((p -= 2) * p * ((this._p2 + 1) * p + this._p2) + 2);
	})
);
//SlowMo
export const SlowMo = class extends Ease {
	constructor(linearRatio, power, yoyoMode) {
		const ppower = (power || power === 0) ? power : 0.7;
		let plinearRatio;
		if (linearRatio === undefined) {
			plinearRatio = 0.7;
		} else if (linearRatio > 1) {
			plinearRatio = 1;
		}
		this._p = (plinearRatio !== 1) ? ppower : 0;
		this._p1 = (1 - plinearRatio) / 2;
		this._p2 = plinearRatio;
		this._p3 = this._p1 + this._p2;
		this._calcEnd = (yoyoMode === true);
	}
	getRatio(p) {
		var r = p + (0.5 - p) * this._p;
		if (p < this._p1) {
			return this._calcEnd ? 1 - ((p = 1 - (p / this._p1)) * p) : r - ((p = 1 - (p / this._p1)) * p * p * p * r);
		} else if (p > this._p3) {
			return this._calcEnd ? 1 - (p = (p - this._p3) / this._p1) * p : r + ((p - r) * (p = (p - this._p3) / this._p1) * p * p * p);
		}
		return this._calcEnd ? 1 : r;
	}
	config(linearRatio, power, yoyoMode) {
		return SlowMo.config(linearRatio, power, yoyoMode);
	}
};

		
let _createElastic;
SlowMo.ease = new SlowMo(0.7, 0.7);

// SteppedEase
export const SteppedEase = class extends Ease {
	constructor(steps = 1) {
		this._p1 = 1 / steps;
		this._p2 = steps + 1;
	}
	getRatio(p) {
		let pp;
		if (p < 0) {
			pp = 0;
		} else if (p >= 1) {
			pp = 0.999999999;
		}
		return ((this._p2 * pp) >> 0) * this._p1;
	}
	config(steps) {
		return SteppedEase.config(steps);
	}
	static config(steps) {
		return SteppedEase.config(steps);
	}
};

// RoughEase
export const RoughEase = class extends Ease {
	constructor(vars = {}) {
		var taper = vars.taper || "none",
			a = [],
			cnt = 0,
			points = (vars.points || 20) | 0,
			i = points,
			randomize = (vars.randomize !== false),
			clamp = (vars.clamp === true),
			template = (vars.template instanceof Ease) ? vars.template : null,
			strength = (typeof(vars.strength) === "number") ? vars.strength * 0.4 : 0.4,
			x, y, bump, invX, obj, pnt;
		while (--i > -1) {
			x = randomize ? Math.random() : (1 / points) * i;
			y = template ? template.getRatio(x) : x;
			if (taper === "none") {
				bump = strength;
			} else if (taper === "out") {
				invX = 1 - x;
				bump = invX * invX * strength;
			} else if (taper === "in") {
				bump = x * x * strength;
			} else if (x < 0.5) {  //"both" (start)
				invX = x * 2;
				bump = invX * invX * 0.5 * strength;
			} else {				//"both" (end)
				invX = (1 - x) * 2;
				bump = invX * invX * 0.5 * strength;
			}
			if (randomize) {
				y += (Math.random() * bump) - (bump * 0.5);
			} else if (i % 2) {
				y += bump * 0.5;
			} else {
				y -= bump * 0.5;
			}
			if (clamp) {
				if (y > 1) {
					y = 1;
				} else if (y < 0) {
					y = 0;
				}
			}
			a[cnt++] = {x:x, y:y};
		}
		a.sort(function(a, b) {
			return a.x - b.x;
		});

		pnt = new EasePoint(1, 1, null);
		i = points;
		while (--i > -1) {
			obj = a[i];
			pnt = new EasePoint(obj.x, obj.y, pnt);
		}

		this._prev = new EasePoint(0, 0, (pnt.t !== 0) ? pnt : pnt.next);
	}
	getRatio(p) {
				var pnt = this._prev;
		if (p > pnt.t) {
			while (pnt.next && p >= pnt.t) {
				pnt = pnt.next;
			}
			pnt = pnt.prev;
		} else {
			while (pnt.prev && p <= pnt.t) {
				pnt = pnt.prev;
			}
		}
		this._prev = pnt;
		return (pnt.v + ((p - pnt.t) / pnt.gap) * pnt.c);
	}
	config(vars) {
		return new RoughEase(vars);
	}
	static config(vars) {
		return new RoughEase(vars);
	}
};

RoughEase.ease = new RoughEase();

//Bounce
wrapEase('Bounce', createEaseClass('BounceOut', (p) => {
	if (p < 1 / 2.75) {
		return 7.5625 * p * p;
	} else if (p < 2 / 2.75) {
		return 7.5625 * (p -= 1.5 / 2.75) * p + 0.75;
	} else if (p < 2.5 / 2.75) {
		return 7.5625 * (p -= 2.25 / 2.75) * p + 0.9375;
	}
	return 7.5625 * (p -= 2.625 / 2.75) * p + 0.984375;
}),
createEaseClass('BounceIn', (p) => {
	if ((p = 1 - p) < 1 / 2.75) {
		return 1 - (7.5625 * p * p);
	} else if (p < 2 / 2.75) {
		return 1 - (7.5625 * (p -= 1.5 / 2.75) * p + 0.75);
	} else if (p < 2.5 / 2.75) {
		return 1 - (7.5625 * (p -= 2.25 / 2.75) * p + 0.9375);
	}
	return 1 - (7.5625 * (p -= 2.625 / 2.75) * p + 0.984375);
}),
createEaseClass('BounceInOut', (p) => {
	const invert = (p < 0.5);
	if (invert) {
		p = 1 - (p * 2);
	} else {
		p = (p * 2) - 1;
	}
	if (p < 1 / 2.75) {
		p = 7.5625 * p * p;
	} else if (p < 2 / 2.75) {
		p = 7.5625 * (p -= 1.5 / 2.75) * p + 0.75;
	} else if (p < 2.5 / 2.75) {
		p = 7.5625 * (p -= 2.25 / 2.75) * p + 0.9375;
	} else {
		p = 7.5625 * (p -= 2.625 / 2.75) * p + 0.984375;
	}
	return invert ? (1 - p) * 0.5 : p * 0.5 + 0.5;
}));

// CIRC
wrapEase('Circ',
createEaseClass('CircOut', (p) => {
	return Math.sqrt(1 - (p = p - 1) * p);
}),
createEaseClass('CircIn', (p) => {
	return -(Math.sqrt(1 - (p * p)) - 1);
}),
createEaseClass('CircInOut', (p) => {
	return ((p*=2) < 1) ? -0.5 * (Math.sqrt(1 - p * p) - 1) : 0.5 * (Math.sqrt(1 - (p -= 2) * p) + 1);
}));

// Elastic

const _createElastic = (n, f, def) => {
	return class E extends Ease {
		constructor(amplitude, period) {
			this._p1 = (amplitude >= 1) ? amplitude : 1; //note: if amplitude is < 1, we simply adjust the period for a more natural feel. Otherwise the math doesn't work right and the curve starts at 1.
			this._p2 = (period || def) / (amplitude < 1 ? amplitude : 1);
			this._p3 = this._p2 / _2PI * (Math.asin(1 / this._p1) || 0);
			this._p2 = _2PI / this._p2; //precalculate to optimize
			this.getRatio = f;
		}
		config(amplitude, period) {
			return new E(amplitude, period);
		}
	};
};
wrapEase('Elastic',
	_createElastic("ElasticOut", (p) => {
		return this._p1 * Math.pow(2, -10 * p) * Math.sin( (p - this._p3) * this._p2 ) + 1;
	}, 0.3),
	_createElastic("ElasticIn", (p) => {
		return -(this._p1 * Math.pow(2, 10 * (p -= 1)) * Math.sin( (p - this._p3) * this._p2 ));
	}, 0.3),
	_createElastic("ElasticInOut", (p) => {
		return ((p *= 2) < 1) ? -0.5 * (this._p1 * Math.pow(2, 10 * (p -= 1)) * Math.sin( (p - this._p3) * this._p2)) : this._p1 * Math.pow(2, -10 *(p -= 1)) * Math.sin( (p - this._p3) * this._p2 ) * 0.5 + 1;
	}, 0.45));

// Expo

wrapEase('Expo', 
	createEaseClass('ExpoOut', (p) => {
		return 1 - Math.pow(2, -10 * p);
	}),
	createEaseClass('ExpoOut', (p) => {
		return Math.pow(2, 10 * (p - 1)) - 0.001;
	}),
	createEaseClass('ExpoOut', (p) => {
		return ((p *= 2) < 1) ? 0.5 * Math.pow(2, 10 * (p - 1)) : 0.5 * (2 - Math.pow(2, -10 * (p - 1)));
	}));


// Sine

wrapEase('Sine',
	createEaseClass('SineOut', (p) => {
		return Math.sin(p * _HALF_PI);
	}),
	createEaseClass('SineIn', (p) => {
		return -Math.cos(p * _HALF_PI) + 1;
	}),
	createEaseClass('SineInOut', (p) => {
		return -0.5 * (Math.cos(Math.PI * p) - 1);
	}));

Ease.register(SlowMo, 'SlowMo', 'ease,');
Ease.register(RoughEase, 'RoughEase', 'ease,');
Ease.register(SteppedEase, 'SteppedEase', 'ease,');

		// _class("easing.EaseLookup", {
		// 		find:function(s) {
		// 			return Ease.map[s];
		// 		}
		// 	}, true);

		//register the non-standard eases
		// _easeReg(w.SlowMo, "SlowMo", "ease,");
		// _easeReg(RoughEase, "RoughEase", "ease,");
		// _easeReg(SteppedEase, "SteppedEase", "ease,");
		
		// return Back;
		
	// }, true);

// }); if (_gsScope._gsDefine) { _gsScope._gsQueue.pop()(); }

//export to AMD/RequireJS and CommonJS/Node (precursor to full modular build system coming at a later date)
// (function() {
// 	"use strict";
// 	var getGlobal = function() {
// 		return (_gsScope.GreenSockGlobals || _gsScope);
// 	};
// 	if (typeof(define) === "function" && define.amd) { //AMD
// 		define(["TweenLite"], getGlobal);
// 	} else if (typeof(module) !== "undefined" && module.exports) { //node
// 		require("../TweenLite.js");
// 		module.exports = getGlobal();
// 	}
// }());