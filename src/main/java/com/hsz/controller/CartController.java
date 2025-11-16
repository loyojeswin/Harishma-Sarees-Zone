package com.hsz.controller;

import com.hsz.config.UserPrincipal;
import com.hsz.dto.MessageResponse;
import com.hsz.model.Cart;
import com.hsz.model.Product;
import com.hsz.model.User;
import com.hsz.repository.CartRepository;
import com.hsz.repository.ProductRepository;
import com.hsz.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/cart")
@PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
public class CartController {

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<Cart>> getCartItems(Authentication authentication) {
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        User user = userRepository.findById(userPrincipal.getId()).orElse(null);
        
        if (user == null) {
            return ResponseEntity.notFound().build();
        }

        List<Cart> cartItems = cartRepository.findByUser(user);
        return ResponseEntity.ok(cartItems);
    }

    @PostMapping("/add")
    public ResponseEntity<?> addToCart(@RequestParam Long productId, 
                                     @RequestParam(defaultValue = "1") Integer quantity,
                                     Authentication authentication) {
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        User user = userRepository.findById(userPrincipal.getId()).orElse(null);
        
        if (user == null) {
            return ResponseEntity.badRequest().body(new MessageResponse("User not found"));
        }

        Optional<Product> productOpt = productRepository.findById(productId);
        if (!productOpt.isPresent() || !productOpt.get().getIsActive()) {
            return ResponseEntity.badRequest().body(new MessageResponse("Product not found"));
        }

        Product product = productOpt.get();
        
        if (product.getStock() < quantity) {
            return ResponseEntity.badRequest().body(new MessageResponse("Insufficient stock"));
        }

        Optional<Cart> existingCart = cartRepository.findByUserAndProduct(user, product);
        
        if (existingCart.isPresent()) {
            Cart cart = existingCart.get();
            int newQuantity = cart.getQuantity() + quantity;
            
            if (product.getStock() < newQuantity) {
                return ResponseEntity.badRequest().body(new MessageResponse("Insufficient stock"));
            }
            
            cart.setQuantity(newQuantity);
            cartRepository.save(cart);
        } else {
            Cart cart = new Cart(user, product, quantity);
            cartRepository.save(cart);
        }

        return ResponseEntity.ok(new MessageResponse("Product added to cart successfully"));
    }

    @PutMapping("/update/{cartId}")
    public ResponseEntity<?> updateCartItem(@PathVariable Long cartId, 
                                          @RequestParam Integer quantity,
                                          Authentication authentication) {
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        
        Optional<Cart> cartOpt = cartRepository.findById(cartId);
        if (!cartOpt.isPresent()) {
            return ResponseEntity.notFound().build();
        }

        Cart cart = cartOpt.get();
        
        if (!cart.getUser().getId().equals(userPrincipal.getId())) {
            return ResponseEntity.badRequest().body(new MessageResponse("Unauthorized"));
        }

        if (cart.getProduct().getStock() < quantity) {
            return ResponseEntity.badRequest().body(new MessageResponse("Insufficient stock"));
        }

        cart.setQuantity(quantity);
        cartRepository.save(cart);

        return ResponseEntity.ok(new MessageResponse("Cart updated successfully"));
    }

    @DeleteMapping("/remove/{cartId}")
    public ResponseEntity<?> removeFromCart(@PathVariable Long cartId, Authentication authentication) {
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        
        Optional<Cart> cartOpt = cartRepository.findById(cartId);
        if (!cartOpt.isPresent()) {
            return ResponseEntity.notFound().build();
        }

        Cart cart = cartOpt.get();
        
        if (!cart.getUser().getId().equals(userPrincipal.getId())) {
            return ResponseEntity.badRequest().body(new MessageResponse("Unauthorized"));
        }

        cartRepository.delete(cart);
        return ResponseEntity.ok(new MessageResponse("Product removed from cart"));
    }

    @DeleteMapping("/clear")
    public ResponseEntity<?> clearCart(Authentication authentication) {
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        User user = userRepository.findById(userPrincipal.getId()).orElse(null);
        
        if (user == null) {
            return ResponseEntity.notFound().build();
        }

        cartRepository.deleteByUser(user);
        return ResponseEntity.ok(new MessageResponse("Cart cleared successfully"));
    }

    @GetMapping("/count")
    public ResponseEntity<Long> getCartItemCount(Authentication authentication) {
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        User user = userRepository.findById(userPrincipal.getId()).orElse(null);
        
        if (user == null) {
            return ResponseEntity.ok(0L);
        }

        Long count = cartRepository.countByUser(user);
        return ResponseEntity.ok(count);
    }
}
