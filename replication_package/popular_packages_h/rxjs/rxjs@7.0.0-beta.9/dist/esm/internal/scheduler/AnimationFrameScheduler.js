import { AsyncScheduler } from './AsyncScheduler';
export class AnimationFrameScheduler extends AsyncScheduler {
    flush(action) {
        this.active = true;
        this.scheduled = undefined;
        const { actions } = this;
        let error;
        let index = -1;
        action = action || actions.shift();
        const count = actions.length;
        do {
            if (error = action.execute(action.state, action.delay)) {
                break;
            }
        } while (++index < count && (action = actions.shift()));
        this.active = false;
        if (error) {
            while (++index < count && (action = actions.shift())) {
                action.unsubscribe();
            }
            throw error;
        }
    }
}
//# sourceMappingURL=AnimationFrameScheduler.js.map