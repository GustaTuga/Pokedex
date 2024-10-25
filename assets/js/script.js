const pokemonGrid = document.getElementById('pokemonGrid');
        const loadMoreButton = document.getElementById('loadMore');
        const pokemonDetail = document.getElementById('pokemonDetail');
        let nextUrl = 'https://pokeapi.co/api/v2/pokemon?limit=12';

        const typeColors = {
            normal: '#A8A878', fire: '#F08030', water: '#6890F0', electric: '#F8D030',
            grass: '#78C850', ice: '#98D8D8', fighting: '#C03028', poison: '#A040A0',
            ground: '#E0C068', flying: '#A890F0', psychic: '#F85888', bug: '#A8B820',
            rock: '#B8A038', ghost: '#705898', dragon: '#7038F8', dark: '#705848',
            steel: '#B8B8D0', fairy: '#EE99AC'
        };

        async function fetchPokemon() {
            if (!nextUrl) return;
            loadMoreButton.disabled = true;
            loadMoreButton.textContent = 'Carregando...';
            
            try {
                const response = await fetch(nextUrl);
                const data = await response.json();
                nextUrl = data.next;
                
                const pokemonDetails = await Promise.all(
                    data.results.map(async (pokemon) => {
                        const res = await fetch(pokemon.url);
                        return res.json();
                    })
                );
                
                renderPokemonCards(pokemonDetails);
            } catch (error) {
                console.error('Erro ao buscar Pokémon:', error);
            } finally {
                loadMoreButton.disabled = false;
                loadMoreButton.textContent = 'Carregar Mais';
            }
        }

        function renderPokemonCards(pokemonList) {
            pokemonList.forEach(pokemon => {
                const card = document.createElement('div');
                card.className = 'pokemon-card';
                card.style.backgroundColor = typeColors[pokemon.types[0].type.name];
                
                card.innerHTML = `
                    <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}">
                    <div class="pokemon-info">
                        <h2 class="pokemon-name">${pokemon.name}</h2>
                        <div class="pokemon-types">
                            ${pokemon.types.map(type => `
                                <span class="type-badge" style="background-color: ${typeColors[type.type.name]}">
                                    ${type.type.name}
                                </span>
                            `).join('')}
                        </div>
                    </div>
                `;
                
                card.addEventListener('click', () => showPokemonDetail(pokemon));
                pokemonGrid.appendChild(card);
            });
        }

        function showPokemonDetail(pokemon) {
            pokemonGrid.style.display = 'none';
            loadMoreButton.style.display = 'none';
            pokemonDetail.style.display = 'block';
            
            pokemonDetail.innerHTML = `
                <button id="backButton">← Voltar</button>
                <div class="detail-header">
                    <span class="detail-name">${pokemon.name}</span>
                    <span class="detail-number">#${pokemon.id.toString().padStart(3, '0')}</span>
                </div>
                <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}">
                <div class="detail-types">
                    ${pokemon.types.map(type => `
                        <span class="type-badge" style="background-color: ${typeColors[type.type.name]}">
                            ${type.type.name}
                        </span>
                    `).join('')}
                </div>
                <div class="detail-info">
                    <div>
                        <p><strong>Altura:</strong> ${pokemon.height / 10} m</p>
                        <p><strong>Peso:</strong> ${pokemon.weight / 10} kg</p>
                    </div>
                    <div>
                        <p><strong>Habilidades:</strong> ${pokemon.abilities.map(a => a.ability.name).join(', ')}</p>
                    </div>
                </div>
                <h3>Estatísticas</h3>
                ${pokemon.stats.map(stat => `
                    <div class="detail-stat">
                        <span class="stat-name">${formatStatName(stat.stat.name)}:</span> ${stat.base_stat}
                        <div class="stat-bar">
                            <div class="stat-fill" style="width: ${(stat.base_stat / 255) * 100}%"></div>
                        </div>
                    </div>
                `).join('')}
            `;
            
            document.getElementById('backButton').addEventListener('click', hideDetail);
        }

        function hideDetail() {
            pokemonGrid.style.display = 'grid';
            loadMoreButton.style.display = 'block';
            pokemonDetail.style.display = 'none';
        }

        function formatStatName(statName) {
            const statNameMap = {
                'hp': 'HP',
                'attack': 'Ataque',
                'defense': 'Defesa',
                'special-attack': 'Atq. Esp.',
                'special-defense': 'Def. Esp.',
                'speed': 'Velocidade'
            };
            return statNameMap[statName] || statName;
        }

        loadMoreButton.addEventListener('click', fetchPokemon);
        fetchPokemon();