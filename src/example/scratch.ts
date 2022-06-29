

class Model {
    static protected_keys;
    static init() {
        console.log(this.protected_keys)
    }
}

function PII(object, member) {
    object.constructor.protected_keys = object.constructor.protected_keys || [];
    object.constructor.protected_keys.push(member);
}

class Customer extends Model {
    @PII
    name;
    @PII
    email;
}

Customer.init()
console.log(Customer.protected_keys)