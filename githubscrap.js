const request = require("request");
const cheerio = require("cheerio");
let fs = require("fs");
let $;
let data = {};


function linkGenerator(error, response, body)
{
    if(!error)
    {
        $ = cheerio.load(body);

        //anchor tag 
        let allTopics = $(".no-underline.d-flex.flex-column.flex-justify-center");

        //anchor tag having 3 topic names
        let allTopicNames = $(".f3.lh-condensed.text-center.Link--primary.mb-0.mt-1");
        
        for(let x =0;x<3;x++)
        {
            //console.log($(allTopicNames[x]).text().trim());
            //console.log("https://github.com/" + $(allTopics[x]).attr("href"));

            getTopicPage($(allTopicNames[x]).text().trim(),
                        "https://github.com/" + $(allTopics[x]).attr("href") );
        }
    }
}


function getTopicPage(name,url)
{
    //url request -> html page save
    //request(url, saveTopicPage);

    // topic page and links

    request(url, function(error , res, body)
    {
            if(!error && res.statusCode == 200)
            {
                $ = cheerio.load(body);

                //isse project ke anchor tags mil gaye
                let allProjects = $(".f3.color-text-secondary.text-normal.lh-condensed .text-bold");

                if(allProjects.length > 8)
                {
                    allProjects = allProjects.slice(0,8);
                }

                for(let x = 0;x< allProjects.length;x++)
                {
                   
                    let projectTitle = $(allProjects[x]).text().trim();

                    let projectLink = "https://github.com/" + $(allProjects[x]).attr("href");

                    if(!data[name])
                    {
                        data[name] = [{ name : projectTitle,
                                    link : projectLink
                        }];
                    }
                    else
                    {
                            data[name].push({ name : projectTitle,
                                link : projectLink
                            });
                    }

                    
                }

                fs.writeFileSync("data.json", JSON.stringify(data));
            }
    });
    
}

request("https://github.com/topics",linkGenerator); // callBack function