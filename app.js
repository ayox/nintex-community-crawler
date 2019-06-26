const Crawler = require("crawler");
const util = require("util");
const request = require("request");

const search = "Update item permission ";
const searchKeyWords = search.replace(/ /g, "+");
const searchUrl = `https://community.nintex.com/t5/forums/forumpage.searchformv3.messagesearchfield.messagesearchfield:autocomplete?t:ac=board-id/Nintex_for_O365&t:cp=search/contributions/page&q=${searchKeyWords}+&limit=1000&timestamp=1561518763259&searchContext=Nintex_for_O365%7Cforum-board`;

const threadCrawler = new Crawler({
  maxConnections: 10,
  // This will be called for each crawled page
  callback: function(error, res, done) {
    if (error) {
      console.log(error);
    } else {
      let q = "";
      let a = "";
      const $ = res.$;
      q = $(
        "#messageView2_1 > div.MessageView.lia-message-view-forum-message.lia-message-view-display.lia-row-standard-unread.lia-thread-topic.lia-list-row-thread-solved.lia-message-authored-by-you > div > div.lia-quilt-row.lia-quilt-row-main > div.lia-quilt-column.lia-quilt-column-19.lia-quilt-column-right.lia-quilt-column-main-content > div > div.topic-subject-wrapper > div > div > div > h2 > span > div"
      ).text();
      q+= '\n' + $("#bodyDisplay > div")
        .find("p")
        .text();
      a = $(
        `.lia-img-message-type-solution.lia-fa-message.lia-fa-type.lia-fa-solution.lia-fa`
      )
        .parents(".lia-quilt-column-alley.lia-quilt-column-alley-right")
        .find("p")
        .text();
      console.log(util.inspect({ q, a }, false, 5, true));
    }
    done();
  }
});
request(searchUrl, function(error, response, body) {
  if (error) return;
  const result = JSON.parse(body);
  result.forEach(item => {
    const data = item.data[0];
    const f = data.indexOf('href="/t5');
    const to = data.indexOf(`"`, f + 'href="'.length);
    const from = f + 'href="'.length;
    const relativeUrl = data.substr(from, to - from);
    const url = `https://community.nintex.com/${relativeUrl}`;
    console.log({url});
    threadCrawler.queue(url);
  });
  // console.log(body);
  // const regex = /href\s*=\s*(['"])\1/gi;
  // const link = regex.exec(body);
  // console.log(link);
  // body.forEach(item => {
  //   console.log(item);
  // });

  // console.log(JSON.stringify(body));
  //   let link = ""
  //   while((link = regex.exec(JSON.stringify(body))) !== null) {
  //     console.log(link);
  //     var url = "https://community.nintex.com" + link[2];
  //     console.log(url);
  // var patt = /<a href="(.*?)"/g;
  // while(match=patt.exec(body)){
  //   console.log(match[1]);
  // }
  // }
});

// Queue just one URL, with default callback
// threadCrawler.queue(
//   "https://community.nintex.com/t5/Nintex-for-Office-365/how-to-upload-file-with-Office-365-upload-file-action/m-p/34032#M4646"
// );

// // Queue a list of URLs
// threadCrawler.queue(['http://www.google.com/','http://www.yahoo.com']);
//
// // Queue URLs with custom callbacks & parameters
// threadCrawler.queue([{
//     uri: 'http://parishackers.org/',
//     jQuery: false,
//
//     // The global callback won't be called
//     callback: function (error, res, done) {
//         if(error){
//             console.log(error);
//         }else{
//             console.log('Grabbed', res.body.length, 'bytes');
//         }
//         done();
//     }
// }]);
//
