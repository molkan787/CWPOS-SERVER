const daySeconds = 3600 * 24;

class TimeHelper{

    today(){
        return this.roundToDay(this.now());
    }

    now(){
        return Math.floor(Date.now() / 1000);
    }

    roundToDay(time){
        return time - (time % daySeconds)
    }
}

module.exports = new TimeHelper();