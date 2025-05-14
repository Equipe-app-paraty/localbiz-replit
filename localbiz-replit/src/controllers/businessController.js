const Business = require('../models/business');
const googleMapsService = require('../services/googleMapsService');

// Buscar estabelecimentos por localização e tipo
exports.searchBusinesses = async (req, res) => {
  try {
    const { location, businessType, hasWebsite, hasPhone } = req.query;
    
    // Converter strings para booleanos
    const filters = {
      hasWebsite: hasWebsite === 'true',
      hasPhone: hasPhone === 'true'
    };
    
    // Buscar estabelecimentos via Google Maps API
    const results = await googleMapsService.searchBusinesses(location, businessType, filters);
    
    // Processar e salvar os resultados no banco de dados
    const businesses = await Promise.all(
      results.results.map(async (place) => {
        // Verificar se o estabelecimento já existe no banco
        let business = await Business.findOne({ googlePlaceId: place.place_id });
        
        if (!business) {
          // Obter detalhes completos do estabelecimento
          const details = await googleMapsService.getBusinessDetails(place.place_id);
          
          // Criar novo registro no banco
          business = new Business({
            googlePlaceId: place.place_id,
            name: place.name,
            address: place.formatted_address || details.formatted_address,
            phone: place.formatted_phone_number || details.formatted_phone_number,
            website: place.website || details.website,
            businessType,
            openingHours: details.opening_hours ? details.opening_hours.weekday_text : [],
            location: {
              type: 'Point',
              coordinates: [
                place.geometry.location.lng,
                place.geometry.location.lat
              ]
            },
            hasWebsite: !!place.website || !!details.website,
            hasPhone: !!place.formatted_phone_number || !!details.formatted_phone_number
          });
          
          await business.save();
        }
        
        return business;
      })
    );
    
    res.json({
      businesses,
      nextPageToken: results.nextPageToken
    });
  } catch (error) {
    console.error('Erro ao buscar estabelecimentos:', error);
    res.status(500).json({ error: 'Falha ao buscar estabelecimentos' });
  }
};

// Obter detalhes de um estabelecimento específico
exports.getBusinessDetails = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Buscar estabelecimento no banco de dados
    const business = await Business.findById(id);
    
    if (!business) {
      return res.status(404).json({ error: 'Estabelecimento não encontrado' });
    }
    
    res.json(business);
  } catch (error) {
    console.error('Erro ao obter detalhes do estabelecimento:', error);
    res.status(500).json({ error: 'Falha ao obter detalhes do estabelecimento' });
  }
};