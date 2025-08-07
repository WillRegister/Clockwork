import React, { useState, useEffect } from 'react';
import './FoodSearch.css';
import CustomButton from './CustomButton';
import foundationFoods from './foundation_foods.json';

/**
 * A component for searching and managing a list of foods with nutritional information.
 * It provides an autocomplete search bar, displays a list of selected foods with their
 * nutrient data, and calculates the total nutritional values for the list.
 * Users can also save the list as a named recipe.
 */
const FoodSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [selectedFoods, setSelectedFoods] = useState([]);
  const [totals, setTotals] = useState({});
  const [recipeName, setRecipeName] = useState('');

  // Memoize the food list to prevent re-processing on every render
  const foodData = React.useMemo(() => foundationFoods.FoundationFoods, []);

  // Effect to calculate totals whenever the list of selected foods changes
  useEffect(() => {
    const calculateTotals = () => {
      const newTotals = {};
      selectedFoods.forEach(food => {
        food.foodNutrients.forEach(nutrientInfo => {
          const name = nutrientInfo.nutrient.name;
          const unit = nutrientInfo.nutrient.unitName;
          const amount = nutrientInfo.amount || 0;

          if (!newTotals[name]) {
            newTotals[name] = { total: 0, unit };
          }
          newTotals[name].total += amount;
        });
      });
      setTotals(newTotals);
    };
    calculateTotals();
  }, [selectedFoods]);

  /**
   * Handles changes to the search input, filtering for autocomplete suggestions.
   * @param {React.ChangeEvent<HTMLInputElement>} e - The input change event.
   */
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (value.length > 1) {
      const filteredSuggestions = foodData.filter(food =>
        food.description.toLowerCase().includes(value.toLowerCase())
      ).slice(0, 10); // Limit suggestions for performance
      setSuggestions(filteredSuggestions);
    } else {
      setSuggestions([]);
    }
  };

  /**
   * Adds a selected food to the list and clears the search.
   * @param {object} food - The food object to add.
   */
  const handleSelectFood = (food) => {
    setSelectedFoods(prevFoods => [...prevFoods, food]);
    setSearchTerm('');
    setSuggestions([]);
  };

  /**
   * Handles key presses in the search input, specifically for "Enter".
   * @param {React.KeyboardEvent<HTMLInputElement>} e - The keyboard event.
   */
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && suggestions.length > 0) {
      handleSelectFood(suggestions[0]);
    }
  };
  
  /**
   * Saves the current list of foods as a recipe to the backend.
   */
  const handleSaveRecipe = async () => {
    if (!recipeName || selectedFoods.length === 0) {
      alert('Please enter a recipe name and add at least one food.');
      return;
    }
    
    // In a real app, this would be a POST request to your backend
    console.log('Saving recipe:', { name: recipeName, foods: selectedFoods });
    // Example:
    // try {
    //   const response = await fetch('/api/recipe', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({ name: recipeName, foods: selectedFoods.map(f => f.fdcId) })
    //   });
    //   if (!response.ok) throw new Error('Failed to save recipe');
    //   alert('Recipe saved!');
    //   setRecipeName('');
    //   setSelectedFoods([]);
    // } catch (error) {
    //   console.error('Save recipe error:', error);
    //   alert('Error saving recipe.');
    // }
    alert(`Recipe "${recipeName}" saved locally for demonstration.`);
  };


  return (
    <div className="food-search-container">
      <h2 className="text-2xl text-cyan-300 mb-4">Recipe Builder</h2>
      <div className="search-wrapper">
        <input
          type="text"
          className="search-bar"
          placeholder="Search for a food..."
          value={searchTerm}
          onChange={handleSearchChange}
          onKeyDown={handleKeyDown}
        />
        {suggestions.length > 0 && (
          <ul className="suggestions-list">
            {suggestions.map((food, index) => (
              <li key={index} onClick={() => handleSelectFood(food)}>
                {food.description}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="recipe-section">
        <div className="food-list">
          <h3 className="text-xl text-cyan-400">Selected Foods</h3>
          {selectedFoods.length === 0 ? <p>No foods added yet.</p> : (
            <ul>
              {selectedFoods.map((food, index) => (
                <li key={index}>{food.description}</li>
              ))}
            </ul>
          )}
        </div>

        <div className="totals-list">
          <h3 className="text-xl text-cyan-400">Nutritional Totals</h3>
           {Object.keys(totals).length === 0 ? <p>Totals will be calculated here.</p> : (
            <ul>
              {Object.entries(totals).map(([name, { total, unit }]) => (
                <li key={name}>
                  <strong>{name}:</strong> {total.toFixed(2)} {unit.toLowerCase()}
                </li>
              ))}
            </ul>
           )}
        </div>
      </div>
      
      <div className="save-recipe-section">
        <input
          type="text"
          className="recipe-name-input"
          placeholder="Recipe Name"
          value={recipeName}
          onChange={(e) => setRecipeName(e.target.value)}
        />
        <CustomButton variant="primary" onClick={handleSaveRecipe}>
          Save Recipe
        </CustomButton>
      </div>

    </div>
  );
};

export default FoodSearch;
