const ActionModel = require('../models/Action');
const AC = require('./ActionConsts');
const OrderGroup = require('./OrderGroup');

module.exports = class Action{

    static async add(group, type, ref, slot, data){
        return await ActionModel.add(group, type, ref, slot, data);
    }

    static async getBulkByRef(ref){
        let filters;

        if(typeof ref == 'number'){
            filters = {ref1: ref};
        }else if(typeof ref == 'object'){
            filters = ref;
        }

        return await ActionModel.query().where(filters);
    }

    static async reverse(action){
        if(action instanceof Array){
            for(let i = 0; i < action.length; i++){
                await this.reverse(action[i]);
            }
            return;
        }
        const ax = (typeof action == 'number') ? await ActionModel.query().findById(action) : action;
        await ActionModel.query().patch({reversed: 1}).where({id: ax.id});
        switch (ax.ax_group) {
            case AC.GROUP_ORDER:
                return await OrderGroup.reverse(ax);
            default:
                break;
        }
    }

    static async patch(data, ids){
        if(typeof data != 'object' || !(ids instanceof Array)){
            throw new Error('Invalid arguments');
        }
        await ActionModel.query().patch(data).whereIn('id', ids);
    }

    static getActionsByRef1(ref){
        return ActionModel.query().where({ref1: ref});
    }

}