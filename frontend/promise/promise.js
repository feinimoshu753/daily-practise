function MyPromise(callback) {
    if (!(this instanceof MyPromise)) {
        throw new Error(this + 'is not a MyPromise');
    }

    if (typeof callback !== 'function') {
        throw new Error(callback + 'is not a function');
    }

    this.status = 'pending';
    this.successDeps = [];
    this.errorDeps = [];
    this.finallyDep = '';
    this.value = '';
    this.end = false;
    var resolve = function (value) {
        this.status = 'fulfilled';
        this.value = value;
        if (this.end === false && this.successDeps.length > 0) {
            this.successDeps[0](value);
            this.finallyDep && this.finallyDep();
            this.end = true;
        }
    };
    var reject = function (value) {
        this.status = 'rejected';
        this.value = value;
        if (this.end === false && this.errorDeps.length > 0) {
            this.errorDeps[0](value);
            this.finallyDep && this.finallyDep();
            this.end = true;
        }
    };
    callback(resolve.bind(this), reject.bind(this));
}

MyPromise.prototype.then = function (success, error) {
    if (this.end === true) {
        return this;
    }

    if (this.status === 'pending') {
        typeof success === 'function' && this.successDeps.push(success);
        typeof error === 'function' && this.errorDeps.push(error);
    } else if (this.status === 'fulfilled') {
        typeof success === 'function' && success(this.value);
        this.finallyDep && this.finallyDep();
        this.end = true;
    } else if (this.status === 'rejected') {
        typeof error === 'function' && error(this.value);
        this.finallyDep && this.finallyDep();
        this.end = true;
    }
    return this;
};

MyPromise.prototype.catch = function (error) {
    if (this.end === true) {
        return this;
    }

    if (this.status === 'pending') {
        typeof error === 'function' && this.errorDeps.push(error);
    } else if (this.status === 'rejected') {
        typeof error === 'function' && error(this.value);
        this.finallyDep && this.finallyDep();
        this.end = true;
    }
    return this;
};

MyPromise.prototype.finally = function (callback) {
    this.finallyDep = callback;
};

MyPromise.all = function (promises) {
    if (!Array.isArray(promises)) {
        console.error(promises + 'is not array');
        return;
    }

    var values = [];
    var total = 0;
    promises.forEach(function (value) {
        if (value instanceof MyPromise) {
            value.then(function () {
                total++;
            });
        }
    });

    return new MyPromise(function (resolve, reject) {
        if (values.length === total) {
            resolve(values);
        } else {
            reject(values);
        }
    })
};

