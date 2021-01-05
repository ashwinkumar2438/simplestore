import {transactionPromise} from "./keys.js";

export function _then(fn){

    if(!(fn && fn.constructor===Function))return;

    if(this[transactionPromise]){
        this[transactionPromise]=this[transactionPromise].then(fn);
    }
    return this;
}

export function _catch(fn){
    if(!(fn && fn.constructor===Function))return;

    if(this[transactionPromise]){
        this[transactionPromise]=this[transactionPromise].catch(fn);
    }
    return this;
}

export function _finally(fn){
    if(!(fn && fn.constructor===Function))return;

    if(this[transactionPromise]){
        this[transactionPromise]=this[transactionPromise].finally(fn);
    }

    return this;
}
