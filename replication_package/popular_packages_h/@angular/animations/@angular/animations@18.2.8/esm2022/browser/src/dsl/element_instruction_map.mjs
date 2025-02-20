export class ElementInstructionMap {
    constructor() {
        this._map = new Map();
    }
    get(element) {
        return this._map.get(element) || [];
    }
    append(element, instructions) {
        let existingInstructions = this._map.get(element);
        if (!existingInstructions) {
            this._map.set(element, (existingInstructions = []));
        }
        existingInstructions.push(...instructions);
    }
    has(element) {
        return this._map.has(element);
    }
    clear() {
        this._map.clear();
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWxlbWVudF9pbnN0cnVjdGlvbl9tYXAuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9hbmltYXRpb25zL2Jyb3dzZXIvc3JjL2RzbC9lbGVtZW50X2luc3RydWN0aW9uX21hcC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFTQSxNQUFNLE9BQU8scUJBQXFCO0lBQWxDO1FBQ1UsU0FBSSxHQUFHLElBQUksR0FBRyxFQUF1QyxDQUFDO0lBcUJoRSxDQUFDO0lBbkJDLEdBQUcsQ0FBQyxPQUFZO1FBQ2QsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLENBQUM7SUFDdEMsQ0FBQztJQUVELE1BQU0sQ0FBQyxPQUFZLEVBQUUsWUFBNEM7UUFDL0QsSUFBSSxvQkFBb0IsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUNsRCxJQUFJLENBQUMsb0JBQW9CLEVBQUUsQ0FBQztZQUMxQixJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxvQkFBb0IsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQ3RELENBQUM7UUFDRCxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsR0FBRyxZQUFZLENBQUMsQ0FBQztJQUM3QyxDQUFDO0lBRUQsR0FBRyxDQUFDLE9BQVk7UUFDZCxPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQ2hDLENBQUM7SUFFRCxLQUFLO1FBQ0gsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztJQUNwQixDQUFDO0NBQ0YiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5kZXYvbGljZW5zZVxuICovXG5pbXBvcnQge0FuaW1hdGlvblRpbWVsaW5lSW5zdHJ1Y3Rpb259IGZyb20gJy4vYW5pbWF0aW9uX3RpbWVsaW5lX2luc3RydWN0aW9uJztcblxuZXhwb3J0IGNsYXNzIEVsZW1lbnRJbnN0cnVjdGlvbk1hcCB7XG4gIHByaXZhdGUgX21hcCA9IG5ldyBNYXA8YW55LCBBbmltYXRpb25UaW1lbGluZUluc3RydWN0aW9uW10+KCk7XG5cbiAgZ2V0KGVsZW1lbnQ6IGFueSk6IEFuaW1hdGlvblRpbWVsaW5lSW5zdHJ1Y3Rpb25bXSB7XG4gICAgcmV0dXJuIHRoaXMuX21hcC5nZXQoZWxlbWVudCkgfHwgW107XG4gIH1cblxuICBhcHBlbmQoZWxlbWVudDogYW55LCBpbnN0cnVjdGlvbnM6IEFuaW1hdGlvblRpbWVsaW5lSW5zdHJ1Y3Rpb25bXSkge1xuICAgIGxldCBleGlzdGluZ0luc3RydWN0aW9ucyA9IHRoaXMuX21hcC5nZXQoZWxlbWVudCk7XG4gICAgaWYgKCFleGlzdGluZ0luc3RydWN0aW9ucykge1xuICAgICAgdGhpcy5fbWFwLnNldChlbGVtZW50LCAoZXhpc3RpbmdJbnN0cnVjdGlvbnMgPSBbXSkpO1xuICAgIH1cbiAgICBleGlzdGluZ0luc3RydWN0aW9ucy5wdXNoKC4uLmluc3RydWN0aW9ucyk7XG4gIH1cblxuICBoYXMoZWxlbWVudDogYW55KTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuX21hcC5oYXMoZWxlbWVudCk7XG4gIH1cblxuICBjbGVhcigpIHtcbiAgICB0aGlzLl9tYXAuY2xlYXIoKTtcbiAgfVxufVxuIl19