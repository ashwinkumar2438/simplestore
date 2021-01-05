import {transactionPromise} from "./keys.js";

export function _then(fn){

    if(!(fn && fn.constructor===Function))return;

    if(this[transactionPromise]){
        return this[transactionPromise].then(fn);
    }
    else throw new Error("SimpleStore: no active transaction.");
}

export function _catch(fn){
    if(!(fn && fn.constructor===Function))return;

    if(this[transactionPromise]){
        return this[transactionPromise].catch(fn);
    }
    else throw new Error("SimpleStore: no active transaction.");
}

export function _finally(fn){
    if(!(fn && fn.constructor===Function))return;

    if(this[transactionPromise]){
        return this[transactionPromise].finally(fn);
    }

    else throw new Error("SimpleStore: no active transaction.");
}
