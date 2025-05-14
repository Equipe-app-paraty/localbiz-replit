const axios = require('axios');

class GoogleMapsService {
  constructor() {
    this.apiKey = process.env.GOOGLE_PLACES_API_KEY;
    this.baseUrl = 'https://places.googleapis.com/v1/places';
  }

  async searchBusinesses(location, type, filters = {}) {
    try {
      // Construir a URL para a API Places V1
      const url = `${this.baseUrl}:searchText`;
      
      // Extrair coordenadas da localização (simplificado - você pode precisar de geocodificação)
      // Aqui estamos assumindo que location é uma string como "São Paulo, SP"
      
      // Corpo da requisição para a API V1
      const requestBody = {
        textQuery: `${type} in ${location}`,
        languageCode: "pt-BR",
        maxResultCount: 20
      };
      
      // Fazer a requisição à API
      const response = await axios.post(url, requestBody, {
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': this.apiKey,
          'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.websiteUri,places.nationalPhoneNumber,places.location,places.types'
        }
      });
      
      // Processar os resultados
      let results = response.data.places || [];
      
      // Filtrar os resultados conforme os filtros fornecidos
      if (filters.hasWebsite !== undefined) {
        results = results.filter(place => 
          filters.hasWebsite ? !!place.websiteUri : !place.websiteUri
        );
      }
      
      if (filters.hasPhone !== undefined) {
        results = results.filter(place => 
          filters.hasPhone ? !!place.nationalPhoneNumber : !place.nationalPhoneNumber
        );
      }
      
      // Transformar para o formato esperado pelo resto do código
      const transformedResults = results.map(place => ({
        place_id: place.id,
        name: place.displayName?.text || place.displayName,
        formatted_address: place.formattedAddress,
        formatted_phone_number: place.nationalPhoneNumber,
        website: place.websiteUri,
        geometry: {
          location: {
            lat: place.location?.latitude,
            lng: place.location?.longitude
          }
        },
        types: place.types
      }));
      
      return {
        results: transformedResults,
        nextPageToken: response.data.nextPageToken
      };
    } catch (error) {
      console.error('Erro ao buscar estabelecimentos:', error);
      if (error.response) {
        console.error('Dados da resposta:', error.response.data);
      }
      throw new Error('Falha ao buscar estabelecimentos');
    }
  }

  async getBusinessDetails(placeId) {
    try {
      // Construir a URL para a API Places V1
      const url = `${this.baseUrl}/${placeId}`;
      
      // Campos a serem retornados
      const fields = "displayName,formattedAddress,nationalPhoneNumber,websiteUri,openingHours,location,types";
      
      // Fazer a requisição à API
      const response = await axios.get(url, {
        headers: {
          'X-Goog-Api-Key': this.apiKey,
          'X-Goog-FieldMask': fields
        }
      });
      
      // Transformar a resposta para o formato esperado
      return {
        name: response.data.displayName?.text || response.data.displayName,
        formatted_address: response.data.formattedAddress,
        formatted_phone_number: response.data.nationalPhoneNumber,
        website: response.data.websiteUri,
        opening_hours: {
          weekday_text: response.data.openingHours?.weekdayDescriptions || []
        },
        geometry: {
          location: {
            lat: response.data.location?.latitude,
            lng: response.data.location?.longitude
          }
        },
        types: response.data.types
      };
    } catch (error) {
      console.error(`Erro ao obter detalhes do estabelecimento:`, error);
      if (error.response) {
        console.error('Dados da resposta:', error.response.data);
      }
      throw new Error('Falha ao obter detalhes do estabelecimento');
    }
  }
}

module.exports = new GoogleMapsService();