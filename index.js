//Constant value for cookies
const url_key = 'url='

//EXTRA CREDIT
class Variant_Text {
  element() {
    this.vtext = ''
  }

  text(text) {
    this.vtext += text.text;
    if (text.lastInTextNode)
    {
      this.completeText(text);
    }
    else
    {
      text.replace('');
    }
  }

  completeText(text) {}
}

//Title of Variant
class Variant_Title extends Variant_Text {
  completeText(text) {
    text.replace(`Variant ${this.vtext.includes('1') ? '1' : '2'}`);
  }
}

//Description of Variant Page
class Variant_Description extends Variant_Text {
  completeText(text) {
    text.replace('Chosen Variant Page');
  }
}

//Personal Link
class Variant_Link extends Variant_Text {
  element(element) {
    super.element();
    element.setAttribute('href', 'https://github.com/allanhuang');
  }

  completeText(text) {
    text.replace('Move to personal page');
  }
}

//Changing Values with HTMLRewriter
const res_rewriter = new HTMLRewriter()
    .on('title', new Variant_Title())
    .on('h1#title', new Variant_Title())
    .on('p#description', new Variant_Description())
    .on('a#url', new Variant_Link())


addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
})



//Request handler
async function handleRequest(request) {


  let variant_url = null;
  //EXTRA Credit, Cookies for Persistent URL
  let cookies = request.headers.get('Cookie');
  //check for cookies
  if (cookies)
  {
    let cookie_array = cookies.split(';');
    let i;
    for (i = 0; i < cookie_array.length; i++)
    {
      cookie_val = cookie_array[i];
      cookie_val = cookie_val.trim();

      //check if cookie has url_key
      if (cookie_val.startsWith(url_key))
      {
        variant_url = cookie_val.substring(url_key.length);
        break;
      }
    }
  }

  //If not variant_url, choose by random
  if (!variant_url)
  {
    let variant_api = await fetch('https://cfw-takehome.developers.workers.dev/api/variants');
    let variant_json = await variant_api.json();


    //randomize between 0-1 when indexing variant array
    variant_url = variant_json.variants[Math.round(Math.random())];
  }

  //CloudFlare fetch/response with rewriter
  let old_response = await fetch(variant_url);

  let page_response = res_rewriter.transform(old_response);

  // let page_url = url_key + variant_url;

  page_response.headers.set('Set-Cookie', url_key + variant_url);

  return page_response
}