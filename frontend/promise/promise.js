function MyPromise(callback) {
    if (typeof callback !== 'function') {
        console.error(callback + 'is not a function');
    }

    this.status = 'pending';
    this.successDeps = [];
    this.errorDeps = [];
    this.value = '';
    this.end = false;
    var resolve = function (value) {
        this.status = 'fulfilled';
        this.value = value;
        if (this.successDeps.length > 0) {
            this.successDeps[0](value);
            this.end = true;
        }
    };
    var reject = function (value) {
        this.status = 'rejected';
        this.value = value;
        if (this.errorDeps.length > 0) {
            this.errorDeps[0](value);
            this.end = true;
        }
    };
    callback(resolve.bind(this), reject.bind(this));
}

MyPromise.prototype.then = function (success, error) {
    if(this.end === true){
        return this;
    }

    if (this.status === 'pending') {
        typeof success === 'function' && this.successDeps.push(success);
        typeof error === 'function' && this.errorDeps.push(error);
    } else if (this.status === 'fulfilled') {
        typeof success === 'function' && success(this.value);
        this.end = true;
    } else if (this.status === 'rejected') {
        typeof error === 'function' && error(this.value);
        this.end = true;
    }
    return this;
};

MyPromise.prototype.catch = function (error) {
    if(this.end === true){
        return this;
    }

    if (this.status === 'pending') {
        typeof error === 'function' && this.errorDeps.push(error);
    } else if (this.status === 'rejected') {
        typeof error === 'function' && error(this.value);
        this.end = true;
    }
    return this;
}