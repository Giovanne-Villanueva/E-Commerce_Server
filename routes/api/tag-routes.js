const router = require('express').Router();
const { Tag, Product, ProductTag } = require('../../models');

// The `/api/tags` endpoint

router.get('/', async (req, res) => {
  // find all tags
  // be sure to include its associated Product data
  try{
    const productData = await Tag.findAll({
      include: [ { model: Product, through:{attributes:['id', 'product_id', 'tag_id']}}]
    });
    // be sure to include its associated Products
    res.status(200).json(productData);
  }
  catch(err){
    res.status(500).json(err)
  }
});

router.get('/:id', async (req, res) => {
  // find a single tag by its `id`
  // be sure to include its associated Product data
  try{
    const tagData = await Tag.findOne({
      where: {id: req.params.id},
      include: [ { model: Product, through:{attributes:['id', 'product_id', 'tag_id']}}]
    });

    if(!tagData){
      res.status(404).json({message: `No Tag was found with that id`});
      return;
    }

    // be sure to include its associated Products
    res.status(200).json(tagData);
  }
  catch(err){
    res.status(500).json(err)
  }
});

router.post('/', async (req, res) => {
  // create a new tag
  
  try{
    const newTag = await Tag.create(req.body)
    // if there's product tags, we need to create pairings to bulk create in the ProductTag model
    if (req.body.productIds.length) {
      const productIdArr = req.body.productIds.map((product_id) => {
        return {
          product_id,
          tag_id: newTag.id
        };
      });
      try{
        await ProductTag.bulkCreate(productIdArr);
      }
      catch(err){
        console.log(err);
        res.status(400).json(err);
      }
    }

    // if no product tags, just respond
    res.status(200).json(newTag);

  } catch (err) {
    console.log(`error is ${err}`)
    res.status(500).json(err);
  }
});

router.put('/:id', async (req, res) => {
  // update a tag's name by its `id` value
  try {
    const tagData = await Tag.update(
      {
        tag_name: req.body.tag_name,
      },
      {
      where: {
        id: req.params.id,
      },
    });

    if (!tagData) {
      res.status(404).json({ message: 'No tag found with that id!' });
      return;
    }

    try{
      const productTags = await ProductTag.findAll({where: { tag_id: req.params.id }});

      if(productTags){
        
        const productIds = productTags.map(({ product_id }) => product_id)
        
        const newProductIds = req.body.productIds
        .filter((product_id) => !productIds.includes(product_id))
        .map((product_id) => {
          return {
            product_id,
            tag_id: req.params.id,
          };
        });

        const productIdsToRemove = productTags
        .filter(({ product_id }) => !req.body.productIds.includes(product_id))
        .map(({ id }) => id);

        try{
          await ProductTag.destroy({ where: { id: productIdsToRemove } }),
          await ProductTag.bulkCreate(newProductIds)
        } catch (err) {
          res.status(500).json(err);
        }
      }
      else{
        console.log(`No products attached to new tag updated`)
      } 
    } catch (err) {
      res.status(500).json(err);
    }

    res.status(200).json(tagData);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.delete('/:id', async (req, res) => {
  // delete on tag by its `id` value
  try {
    const tagData = await Tag.destroy({
      where: {
        id: req.params.id,
      },
    });

    if (!tagData) {
      res.status(404).json({ message: 'No tag found with that id!' });
      return;
    }
    
    try{
      const productTags = await ProductTag.destroy({
        where:{
          tag_id: req.params.id,
        },
      })
      if(!productTags){
        console.log(`The tag had no products attached to the tag`)
      }
    }catch (err) {
      res.status(500).json(err);
    }

    res.status(200).json(tagData);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
