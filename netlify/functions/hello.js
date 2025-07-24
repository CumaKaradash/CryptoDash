// Bu dosya, Netlify Functions için örnek bir handler'dır.
// Next.js API route'larını Netlify Functions'a taşımak isterseniz, buraya fonksiyonlar ekleyebilirsiniz.

exports.handler = async function(event, context) {
  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Netlify Functions çalışıyor!" })
  };
};
