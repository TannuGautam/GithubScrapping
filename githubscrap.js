const request = require("request");
const cheerio = require("cheerio");
let fs = require("fs");
let $;
let data = {};
const { jsPDF } = require("jsPDF");

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

                    getIssuesPage(projectTitle, name, projectLink + "/issues");
                }

                //fs.writeFileSync("data.json", JSON.stringify(data));
            }
    });
    
}

function getIssuesPage(projectName, topicName, url)
{
    request(url, function (error, res, body)
    {
        if(!error)
        {
            $ = cheerio.load(body);

            let allIssues = $(".Link--primary.v-align-middle.no-underline.h4.js-navigation-open");

            for(let x = 0; x < allIssues.length; x++)
            {
                let issueURL = "https://github.com/" + $(allIssues[x]).attr("href");
                
                let issueTitle = $(allIssues[x]).text().trim();

                let index = -1;

                for(let i = 0; i < data[topicName].length; i++)
                {
                    if(data[topicName][i].name === projectName)
                    {
                        index = i;
                        break;
                    }
                }

                if(!data[topicName][index].issues)
                {
                    data[topicName][index].issues = [{ issueTitle , issueURL}];
                }
                else{
                    data[topicName][index].issues.push = [{ issueTitle , issueURL}];
                }
            }
            fs.writeFileSync("data.json", JSON.stringify(data));

            pdfGenerator(data);

        }
    });
}


request("https://github.com/topics",linkGenerator); // callBack function

//storing issues title n URL in pdf with help of jsPDF
function pdfGenerator(d)
{
    for( x in d)
    {
        if(!fs.existsSync(x))
        {
            fs.mkdirSync(x);
            //created folder
        }

        let path = "./" + x + "/";

        for( y in d[x])
        {
            const doc = new jsPDF();

            let issueArr = d[x][y].issues;

            let spacing = 1;

            for(z in issueArr)
            {
                doc.text("issueArr[z].issueTitle", 10, 10 * spacing);
                //these nos. are margin left and top respectively
                doc.text("issueArr[z].issueURL", 10, 10 * spacing + 5);

                spacing++;
            }

            if(fs.existsSync(path + d[x][y].name + ".pdf"))
                fs.unlinkSync(path + d[x][y].name + ".pdf");
            doc.save(path + d[x][y].name + ".pdf");
        }
    }
}