class PGroup{
    constructor(content){
        this.content = content;
    }

    has(value){
        return this.content.indexOf(value)!=-1;
    }

    add(value){
        if(!this.has(value)) return new PGroup(this.content.concat([value]));
        return this;
    }

    delete(value){
        if(!this.has(value)) return this;
        return new PGroup(this.content.filter(a => a !== value));
    }
}

PGroup.prototype.empty = new PGroup([]);

let a = PGroup.prototype.empty.add("a");
let ab = a.add("b");
let b = ab.delete("a");

console.log(b.has("b"));
// → true
console.log(a.has("b"));
// → false
console.log(b.has("a"));
// → false
