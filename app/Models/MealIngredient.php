<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MealIngredient extends Model
{
    public function ingredient(){
        return $this->belongsTo(Ingredient::class);
    }
}
