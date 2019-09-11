const gmail = require('gmail-send');
const config = require('./config');
const Stats = require('../models/Stats');

const maxMinutes = 5;
const checkInterval = (maxMinutes - 2) * 60 * 1000;

module.exports = class StatsNotifier{

    static init(){
        // this.send('<h1>Hello Test!</h1>')
        // this.start();
        // this.check();
    }

    static start(){
        this.reset();
        setInterval(() => this.check(), checkInterval);
    }

    static reset(){
        this.prevStats = { cw: 0, pp: 0, rpp: 0, dt: 0 };
        this.sent = {};
    }

    static check(){
        const d = new Date();
        const h = d.getHours();
        const m = d.getMinutes();

        if(h == 0){
            this.reset();
            return;
        }
        
        const validTime = (m < maxMinutes) && (h >= 9 && h <= 20) && (!this.sent[h]);
        if(validTime){
            this.sent[h] = true;
            this.prepareData(h);
        }
    }

    static async prepareData(hour){
        const prev = this.prevStats;
        const curr = await Stats.getTodays();
        
        const cw = curr.cw - prev.cw;
        const pp = curr.pp - prev.pp;
        const rpp = curr.rpp - prev.rpp;
        const dt = curr.dt - prev.dt;

        const stats = { cw, pp, rpp, dt };
        const data = { stats, totalCW: curr.cw };
        this.prepareHTML(data, hour);
    }

    static prepareHTML(data, hour){
        // console.log(data);
        const st = data.stats;
        const html = `
            <h3>APOS STATS: ${(hour - 1) + 'h => ' + hour + 'h'}</h3>
            <table border="1" style="border-collapse: collapse;">
                <thead>
                    <tr>
                        <th style="padding: 4px">CW</th>
                        <th style="padding: 4px">PP</th>
                        <th style="padding: 4px">RPP</th>
                        <th style="padding: 4px">DT</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td style="padding: 4px">${st.cw}</td>
                        <td style="padding: 4px">${st.pp}</td>
                        <td style="padding: 4px">${st.rpp}</td>
                        <td style="padding: 4px">${st.dt}</td>
                    </tr>
                </tbody>
            </table>
            <h4>Total Car Wash: ${data.totalCW}</h4>
        `;
        this.send(html);
    }

    static send(htmlContent){
        console.log('CONTENT:', htmlContent);
        // gmail({
        //     user: config.email.user,
        //     pass: config.email.password,

        //     to: config.email.sendTo,
        //     subject: 'test subject',
        //     html: htmlContent,
        // });
        console.log('Email sent!')
    }

}