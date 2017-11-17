var STATE = {
    INIT: 1,
    NUM1INPUT: 2,
    NUM1INPUTFLOAT: 3,
    OPTINPUT: 4,
    NUM2INPUT: 5,
    NUM2INPUTFLOAT: 6,
    CACULATE: 7,
    NOP: 8,     // do nothing
    OPTCHANGED: 9,
    OPTCONCAT: 10,
}

var EVENT = {
    DB: 1,     // digit button push down
    PB: 2,     // point button push down
    OB: 3,     // operator btn
    EB: 4,     // equal btn
    CB: 5,     // clear btn
}


var calcFSM = {


    currentState: STATE.INIT,

    transition: function (event) {
        if (event == EVENT.CB) {
            // todo: do cleaning
            this.currentState = STATE.INIT
        }

        switch (this.currentState) {
            case STATE.INIT:
                switch (event) {
                    case EVENT.DB:
                        this.currentState = STATE.NUM1INPUT
                        break;
                    case EVENT.PB:
                        this.currentState = STATE.NUM1INPUTFLOAT
                        break;
                    case EVENT.EB:
                        this.currentState = STATE.NOP
                        break;
                    case EVENT.OB:
                        this.currentState = STATE.OPTINPUT
                        break;
                    case EVENT.CB:
                        this.currentState = STATE.INIT
                        break;
                }
                break;
            case STATE.NUM1INPUT:
                switch (event) {
                    case EVENT.DB:
                        this.currentState = STATE.NUM1INPUT
                        break;
                    case EVENT.PB:
                        this.currentState = STATE.NUM1INPUTFLOAT
                        break;
                    case EVENT.EB:
                        this.currentState = STATE.NOP
                        break;
                    case EVENT.OB:
                        this.currentState = STATE.OPTINPUT
                        break;
                    case EVENT.CB:
                        this.currentState = STATE.INIT
                        break;
                }
                break;
            case STATE.NUM1INPUTFLOAT:
                switch (event) {
                    case EVENT.DB:
                        this.currentState = STATE.NUM1INPUTFLOAT
                        break;
                    case EVENT.PB:
                        this.currentState = STATE.NUM1INPUTFLOAT
                        break;
                    case EVENT.EB:
                        this.currentState = STATE.NOP
                        break;
                    case EVENT.OB:
                        this.currentState = STATE.OPTINPUT
                        break;
                    case EVENT.CB:
                        this.currentState = STATE.INIT
                        break;
                }
                break;
            case STATE.OPTCHANGED:
                if (this.currentState == STATE.OPTINPUT ||
                    this.currentState == STATE.OPTCHANGED)
                    this.currentState = STATE.OPTCHANGED
                    break;
            case STATE.OPTINPUT:
                switch (event) {
                    case EVENT.DB:
                        this.currentState = STATE.NUM2INPUT
                        break;
                    case EVENT.PB:
                        this.currentState = STATE.NUM2INPUTFLOAT
                        break;
                    case EVENT.EB:
                        this.currentState = STATE.NOP
                        break;
                    case EVENT.OB:
                        this.currentState = STATE.OPTINPUT
                        break;
                    case EVENT.CB:
                        this.currentState = STATE.INIT
                        break;
                }
                break;
            case STATE.NUM2INPUT:
                switch (event) {
                    case EVENT.DB:
                        this.currentState = STATE.NUM2INPUT
                        break;
                    case EVENT.PB:
                        this.currentState = STATE.NUM2INPUTFLOAT
                        break;
                    case EVENT.EB:
                        this.currentState = STATE.CACULATE
                        break;
                    case EVENT.OB:
                        this.currentState = STATE.OPTCONCAT
                        break;
                    case EVENT.CB:
                        this.currentState = STATE.INIT
                        break;
                }
                break;
            case STATE.NUM2INPUTFLOAT:
                switch (event) {
                    case EVENT.DB:
                        this.currentState = STATE.NUM2INPUTFLOAT
                        break;
                    case EVENT.PB:
                        this.currentState = STATE.NUM2INPUTFLOAT
                        break;
                    case EVENT.EB:
                        this.currentState = STATE.CACULATE
                        break;
                    case EVENT.OB:
                        this.currentState = STATE.OPTCONCAT
                        break;
                    case EVENT.CB:
                        this.currentState = STATE.INIT
                        break;
                }
                break;
            case STATE.CACULATE:
                switch (event) {
                    case EVENT.DB:
                        this.currentState = STATE.NUM1INPUTFLOAT
                        break;
                    case EVENT.PB:
                        this.currentState = STATE.NUM1INPUTFLOAT
                        break;
                    case EVENT.EB:
                        this.currentState = STATE.CACULATE
                        break;
                    case EVENT.OB:
                        this.currentState = STATE.OPTCONCAT
                        break;
                    case EVENT.CB:
                        this.currentState = STATE.INIT
                        break;
                }
                break;
            case STATE.OPTCONCAT:
                switch (event) {
                    case EVENT.DB:
                        this.currentState = STATE.NUM2INPUT
                        break;
                    case EVENT.PB:
                        this.currentState = STATE.NUM2INPUTFLOAT
                        break;
                    case EVENT.EB:
                        this.currentState = STATE.CACULATE
                        break;
                    case EVENT.OB:
                        this.currentState = STATE.OPTCHANGED
                        break;
                    case EVENT.CB:
                        this.currentState = STATE.INIT
                        break;
                }
        }
    }

}
var myCacl = new Vue({
    el: "#my-calc",
    data: {
        number: 0,
        opt: '',
        num1: 0,
        num2: 0,
        base: 1,
        pointClicked: false,
        formula: ''
    },

    created: function () {
        calcFSM.currentState = STATE.INIT
    },

    computed: {
        range: function (start = 0, end = 1) {
            console.log("log in range" + start + end)
            return new Array(end - start).fill(start).map((el, i) => start + i);
        }
    },

    methods: {
        onOptBtnClicked: function (val) {
            this.opt = val
            var opt = {
                '*': '×',
                '/': '÷',
                '+': '+',
                '-': '-'
            }
            if (calcFSM.currentState == STATE.NUM1INPUTFLOAT ||
                calcFSM.currentState == STATE.NUM1INPUT) {
                calcFSM.transition(EVENT.OB)
                this.num1 = this.number
                this.formula += this.number + opt[val]
                this.number = 0
                return;
            }
            if (calcFSM.currentState == STATE.OPTINPUT ||
                calcFSM.currentState == STATE.OPTCHANGED) {
                this.formula.replace(/.$/, opt[val])
                calcFSM.transition(EVENT.OB)
                return;
            }
            if (calcFSM.currentState == STATE.CACULATE) {
                this.formula += opt[val]
                this.num1 = this.number
                calcFSM.transition(EVENT.OB)
                return;
            }
            if (calcFSM.currentState == STATE.NUM2INPUTFLOAT ||
                calcFSM.currentState == STATE.NUM2INPUT) {
                this.calc()
                this.formula += opt[val]
                this.num1 = this.number
                calcFSM.transition(EVENT.OB)
                return;
            }
        },
        calc: function () {
            this.num2 = this.number
            switch(this.opt) {
                case '+': this.number = this.num1 + this.num2; break
                case '-': this.number = this.num1 - this.num2; break
                case '*': this.number = this.num1 * this.num2; break
                case '/': this.number = this.num1 / this.num2; break
                default: break
            }
            this.formula = this.formula + this.num2
        },
        onEqualBtnClicked: function () {
            calcFSM.transition(EVENT.EB)
            this.calc()
        },
        onDigitBtnClicked: function(digit) {
            if (calcFSM.currentState == STATE.OPTCONCAT) {
                this.number = 0
            }
            calcFSM.transition(EVENT.DB)
            if (calcFSM.currentState == STATE.NUM1INPUTFLOAT ||
                calcFSM.currentState == STATE.NUM2INPUTFLOAT) {
                this.base *= 0.1
                this.number += (this.base * digit)
            } else {
                this.number = this.number * 10 + digit;
            }
        },
        onClearClicked: function() {
            calcFSM.transition(EVENT.CB)
            this.number = 0;
            this.num1 = 0;
            this.num2 = 0;
            this.opt = '';
            this.pointClicked = false;
            this.base = 1;
            this.formula = '';
        },
        onPointBtnClicked: function () {
            if (calcFSM.currentState == STATE.CACULATE) {
                this.formula = ''
                this.number = 0
            }
            calcFSM.transition(EVENT.PB)
        }
    }

})

