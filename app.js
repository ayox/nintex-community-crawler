const Crawler = require("crawler");
const util = require("util");
const request = require("request");
const fs = require("fs");

function community($, res) {
  let q = "";
  let a = "";
  q = $(
    "#messageView2_1 > div.MessageView.lia-message-view-forum-message.lia-message-view-display.lia-row-standard-unread.lia-thread-topic.lia-list-row-thread-solved.lia-message-authored-by-you > div > div.lia-quilt-row.lia-quilt-row-main > div.lia-quilt-column.lia-quilt-column-19.lia-quilt-column-right.lia-quilt-column-main-content > div > div.topic-subject-wrapper > div > div > div > h2 > span > div"
  ).text();
  q += $("title").text();
  q +=
    "\n" +
    $("#bodyDisplay > div")
      .find("p")
      .text();
  a = $(
    `.lia-img-message-type-solution.lia-fa-message.lia-fa-type.lia-fa-solution.lia-fa`
  )
    .parents(".lia-quilt-column-alley.lia-quilt-column-alley-right")
    .find("p")
    .text();
  const url = res.request.uri.href;

  crawlingResults.push({ url, q, a, type: "communityCrawler" });
}
function knowledge($, res) {
  let a;
  let q = $("title").text();
  q += $(".lia-message-subject.lia-component-message-view-widget-subject")
    .find("h2")
    .text();
  let abody = $(
    `.lia-message-body-wrapper.lia-component-message-view-widget-body`
  );
  a = abody.find("p").text();
  if (a === "")
    a = $(".lia-message-body-wrapper.lia-component-message-view-widget-body")
      .find("div")
      .text();
  // a +=abody.find('').text()
  const url = res.request.uri.href;
  crawlingResults.push({ url, q, a, type: "knowledgeBaseCrawler" });
}
function blog($, res) {
  let a;
  let q = $("title").text();
  q += $(
    "#lia-body > div.lia-page > center > div > div > div > div > div.lia-quilt.lia-quilt-blog-article-page.lia-quilt-layout-one-column.lia-top-quilt > div.lia-quilt-row.lia-quilt-row-main > div > div > h1"
  )
    .find("span")
    .text();
  const abody = $(`#bodyDisplay`);
  a = abody.find("p").text();
  // a +=abody.find('').text()
  const url = res.request.uri.href;

  crawlingResults.push({ url, q, a, type: "blogCrawler" });
}
const crawlingResults = [];

const crawler = new Crawler({
  maxConnections: 10,
  // This will be called for each crawled page
  callback: function(error, res, done) {
    if (error) {
      console.log(error);
    } else {
      const $ = res.$;
      if (res.request.uri.hash.includes("type=c")) community($, res);
      else if (res.request.uri.hash.includes("type=k")) knowledge($, res);
      else if (res.request.uri.hash.includes("type=b")) blog($, res);
    }
    done();
  }
});

/*const knowledgeBaseCrawler = new Crawler({
  maxConnections: 10,
  // This will be called for each crawled page
  callback: function(error, res, done) {
    if (error) {
      console.log(error);
    } else {
      const $ = res.$;
      knowledge($, res);
    }
    done();
  }
});
const blogCrawler = new Crawler({
  maxConnections: 10,
  // This will be called for each crawled page
  callback: function(error, res, done) {
    if (error) {
      console.log(error);
    } else {
      const $ = res.$;
      blog($, res);
    }
    done();
  }
});*/

function main(search) {
  search = "Issue Office 365 Update Item Permissions".toLowerCase();
  const searchKeyWords = search.replace(/ /g, "+");
  const searchUrl = `https://community.nintex.com/t5/community/page.searchformv3.messagesearchfield.messagesearchfield:autocomplete?t:cp=search/contributions/page&q=${searchKeyWords}`;
  request(searchUrl, function(error, response, body) {
    if (error) return;
    const result = JSON.parse(body);
    result.forEach(item => {
      const data = item.data[0];
      const f = data.indexOf('href="/t5');
      const to = data.indexOf(`"`, f + 'href="'.length);
      const from = f + 'href="'.length;
      const relativeUrl = data.substr(from, to - from);
      const url = `https://community.nintex.com${relativeUrl}`;
      if (
        data.indexOf(
          "lia-img-message-type-solved lia-fa-message lia-fa-type lia-fa-solved lia-fa"
        ) !== -1 ||
        data.indexOf(
          "lia-img-icon-forum-board lia-fa-icon lia-fa-forum lia-fa-board lia-fa"
        ) !== -1
      ) {
        crawler.queue(url + "/?type=c");
      } else if (
        data.indexOf(
          "lia-img-icon-blog-board lia-fa-icon lia-fa-blog lia-fa-board lia-fa"
        ) !== -1
      ) {
        console.log(url + "/?type=b");
        crawler.queue(url + "/?type=b");
      } else if (
        data.indexOf(
          "lia-img-icon-tkb-board lia-fa-icon lia-fa-tkb lia-fa-board lia-fa"
        ) !== -1
      ) {
        crawler.queue(url + "#type=k");
      } else {
        console.log("else", { url });
      }
    });
  });

  crawler.queue(
    "https://community.nintex.com/t5/Technical-Issues/Office-365-Update-Item-Permissions-return-unusable-List-item-URL/ta-p/90251#type=k"
  );
  crawler.on("drain", function() {
    const write = crawlingResults.map(r => {
      r.answer = r.a.replace(/(\r\n|\n|\r)/gm, "").replace(/(\t)/gm, "");
      r.questions = [r.q.replace(/(\r\n|\n|\r)/gm, "").replace(/(\t)/gm, "")];
      return r;
    });
    fs.writeFileSync("./results.json", JSON.stringify(write));
  });
}

const express = require("express");
const app = express();

app.get("/search", function(req, res) {
  console.log(req.query);
  main(req.query.q);
  res.send("Hello World");
  console.log('Something')
});

app.listen(3000, () => {
  console.log("Listening on 3000");
});
