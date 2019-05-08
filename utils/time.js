const daySeconds = 3600 * 24;

class TimeHelper{

    get daySeconds(){
        return daySeconds;
    }

    today(){
        return this.roundToDay(this.now());
    }

    now(){
        return Math.floor(Date.now() / 1000);
    }

    roundToDay(time){
        return time - (time % daySeconds)
    }

    todayDate(){
        return this.timestampToDate(this.now());
    }

    timestampToDate(unixtimestamp, includeTime){
        // Months array
        const months_arr = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        // Convert timestamp to milliseconds
        const date = new Date(unixtimestamp*1000);
        const year = date.getFullYear();
        const month = months_arr[date.getMonth()];
        const day = date.getDate();
        const hours = date.getHours();
        const minutes = "0" + date.getMinutes();
        const seconds = "0" + date.getSeconds();
       
        let convdataTime = day+' '+month+' '+year;
        if(includeTime)
            convdataTime += ' '+ hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);

        return convdataTime;
    }

    addDay(time){
        return parseInt(time) + daySeconds;
    }
    
}

module.exports = new TimeHelper();